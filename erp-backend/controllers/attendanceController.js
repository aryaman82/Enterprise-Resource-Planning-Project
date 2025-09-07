import pool from '../db.js';

// Helpers
const parseOutBuffer = (value, def = 240) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : def;
};

// GET /api/attendance/for-shift?date=YYYY-MM-DD&shift_code=G&outBufferMinutes=360
export const getAttendanceForShift = async (req, res) => {
  try {
    const { date, shift_code } = req.query;
  // Default after-end buffer to 6 hours to support the clock-out rule (end + 6h)
  const outBufferMinutes = parseOutBuffer(req.query.outBufferMinutes, 360);
    if (!date || !shift_code) {
      return res.status(400).json({ success: false, message: 'date and shift_code are required' });
    }

    // Fetch shift times
    const shiftRes = await pool.query(
      'SELECT shift_code, start_time, end_time FROM shifts WHERE shift_code = $1',
      [shift_code]
    );
    if (shiftRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Shift '${shift_code}' not found` });
    }
    const shift = shiftRes.rows[0];
    if (!shift.start_time || !shift.end_time) {
      return res.json({ success: true, data: [], meta: { date, shift_code, note: 'Shift has no times (OFF or undefined)' } });
    }

    // Employees mapped to this date and shift
    const mapRes = await pool.query(
      `SELECT m.emp_code, e.name
       FROM shiftmapping m
       JOIN employees e ON e.emp_code = m.emp_code
       WHERE m.date = $1::date AND m.shift_code = $2
       ORDER BY m.emp_code ASC`,
      [date, shift_code]
    );
    const employees = mapRes.rows;
    const empCodes = employees.map(r => r.emp_code);

    if (empCodes.length === 0) {
      return res.json({ success: true, data: [], meta: { date, shift_code, counts: { present: 0, working: 0, absent: 0 } } });
    }

    // Fetch punches within window around the shift for all mapped employees.
    // Compute bounds in SQL to stay consistent with Postgres (timestamps without TZ) and IST business rules.
  const punchesRes = await pool.query(
      `WITH params AS (
          SELECT $1::date AS d,
                 $2::time AS start_time,
                 $3::time AS end_time,
                 $4::int  AS out_mins
        ),
        bounds AS (
          SELECT (d + start_time) AS shift_start,
                 CASE WHEN end_time >= start_time
                      THEN (d + end_time)
                      ELSE ((d + interval '1 day') + end_time)
                 END AS shift_end,
                 d, start_time, end_time
          FROM params
        ),
        now_ist AS (
          SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') AS nowts
        )
        SELECT p.emp_code, p.punch_time,
               b.shift_start, b.shift_end,
               n.nowts
        FROM punch_data p
        CROSS JOIN bounds b
        CROSS JOIN now_ist n
        WHERE p.emp_code = ANY($5::text[])
      AND p.punch_time BETWEEN (b.shift_start - interval '4 hours')
                               AND (b.shift_end + make_interval(mins => (SELECT out_mins FROM params)))
        ORDER BY p.emp_code ASC, p.punch_time ASC`,
      [date, shift.start_time, shift.end_time, outBufferMinutes, empCodes]
    );

    // Organize punches by employee
    const punchesByEmp = new Map();
    let nowIst = null;
    let shiftStart = null;
    let shiftEnd = null;
    for (const row of punchesRes.rows) {
      if (!nowIst) nowIst = row.nowts;
      if (!shiftStart) shiftStart = row.shift_start;
      if (!shiftEnd) shiftEnd = row.shift_end;
      if (!punchesByEmp.has(row.emp_code)) punchesByEmp.set(row.emp_code, []);
      punchesByEmp.get(row.emp_code).push(new Date(row.punch_time));
    }

    // If no punches returned, we still need nowIst/shift bounds
    if (!nowIst) {
      const tsRes = await pool.query(
        `SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') AS nowts,
                (d + start_time) AS shift_start,
                CASE WHEN end_time >= start_time
                     THEN (d + end_time)
                     ELSE ((d + interval '1 day') + end_time)
                END AS shift_end
         FROM (SELECT $1::date AS d, $2::time AS start_time, $3::time AS end_time) x`,
        [date, shift.start_time, shift.end_time]
      );
      nowIst = tsRes.rows[0].nowts;
      shiftStart = tsRes.rows[0].shift_start;
      shiftEnd = tsRes.rows[0].shift_end;
    }

    const results = [];
    let present = 0, working = 0, absent = 0;
    // Clock-in window: ±4 hours around shift start
    const inMarginMinutes = 240; // 4 hours
    const startMinus = new Date(new Date(shiftStart).getTime() - inMarginMinutes * 60 * 1000);
    const startPlus = new Date(new Date(shiftStart).getTime() + inMarginMinutes * 60 * 1000);
    const endTs = new Date(shiftEnd);
    const now = new Date(nowIst);

    // Clock-out window: from 2 hours before shift end to 6 hours after shift end
    const outBeforeEndMinutes = 120; // 2 hours before end
    const outAfterEndMinutes = outBufferMinutes; // default 360 = 6 hours after end (configurable via query)
    const outStart = new Date(endTs.getTime() - outBeforeEndMinutes * 60 * 1000);
    const outEnd = new Date(endTs.getTime() + outAfterEndMinutes * 60 * 1000);

    for (const emp of employees) {
      const punches = punchesByEmp.get(emp.emp_code) || [];
      // clock_in: first punch within ±4h of shift start
      const withinStartWindow = punches.filter(t => t >= startMinus && t <= startPlus);
      const clock_in = withinStartWindow.length > 0 ? withinStartWindow[0] : null;

      // clock_out: first punch within the clock-out window [end-2h, end+6h];
      // ignore mid-shift punches outside this window.
      let clock_out = null;
      if (clock_in) {
        const withinOutWindow = punches.filter(t => t >= outStart && t <= outEnd);
        clock_out = withinOutWindow.length > 0 ? withinOutWindow[0] : null;
      }

      let status = 'Absent';
    if (clock_in) {
        const minHoursForPresent = 8; // new rule
        const minMsForPresent = minHoursForPresent * 60 * 60 * 1000;
        if (clock_out && clock_out > clock_in) {
          const workedMs = clock_out.getTime() - clock_in.getTime();
          status = workedMs >= minMsForPresent ? 'Present' : (now < outEnd ? 'Working' : 'Absent');
        } else {
      // No checkout yet — if we're still within or before the out window, they're working
      // Becomes Absent once the out window closes
          status = now < outEnd ? 'Working' : 'Absent';
        }
      }

      if (status === 'Present') present++; else if (status === 'Working') working++; else absent++;
      results.push({
        emp_code: emp.emp_code,
        name: emp.name,
        shift_code,
        attendance_date: date,
        clock_in: clock_in ? clock_in.toISOString() : null,
        clock_out: clock_out ? clock_out.toISOString() : null,
        status
      });
    }

    res.json({
      success: true,
      data: results,
      meta: {
        date,
        shift_code,
        shift_start: new Date(shiftStart).toISOString(),
        shift_end: new Date(shiftEnd).toISOString(),
        now_ist: new Date(nowIst).toISOString(),
        counts: { present, working, absent },
        rules: {
          timezone: 'Asia/Kolkata',
          inMarginMinutes: 240,
          outWindowBeforeEndMinutes: 120,
          outWindowAfterEndMinutes: outAfterEndMinutes,
          minHoursForPresent: 8,
          absentCriteria: {
            noClockIn: true,
            noClockOutAfterWindow: true,
            workedTimeLessThanHours: 8
          }
        }
      }
    });
  } catch (error) {
    console.error('Error computing attendance for shift:', error);
    res.status(500).json({ success: false, message: 'Internal error computing attendance', error: error.message });
  }
};

// GET /api/attendance/current-shifts?outBufferMinutes=240
// Returns shift instances (shift_code, date) that are active "now" in IST.
export const getCurrentShiftInstances = async (req, res) => {
  try {
    const outBufferMinutes = parseOutBuffer(req.query.outBufferMinutes, 240);
    const result = await pool.query(
      `WITH now_ist AS (
         SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') AS nowts,
                (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata')::date AS today
       ),
       base AS (
         SELECT s.shift_code, s.start_time, s.end_time,
                n.nowts,
                n.today AS d
         FROM shifts s, now_ist n
         WHERE s.start_time IS NOT NULL AND s.end_time IS NOT NULL
       ),
       today_shifts AS (
         SELECT shift_code,
                (d + start_time) AS shift_start,
                CASE WHEN end_time >= start_time THEN (d + end_time)
                     ELSE ((d + interval '1 day') + end_time) END AS shift_end,
                'today'::text AS which_date
         FROM base
       ),
       yesterday_shifts AS (
         SELECT shift_code,
                ((d - interval '1 day') + start_time) AS shift_start,
                CASE WHEN end_time >= start_time THEN ((d - interval '1 day') + end_time)
                     ELSE (d + end_time) END AS shift_end,
                'yesterday'::text AS which_date
         FROM base
       ),
       all_shifts AS (
         SELECT * FROM today_shifts
         UNION ALL
         SELECT * FROM yesterday_shifts
       ),
       ist AS (SELECT nowts FROM now_ist)
       SELECT a.shift_code,
              CASE WHEN a.which_date = 'today' THEN (SELECT today FROM now_ist)
                   ELSE ((SELECT today FROM now_ist) - interval '1 day') END AS mapping_date,
              a.shift_start, a.shift_end,
              i.nowts
       FROM all_shifts a CROSS JOIN ist i
       WHERE i.nowts BETWEEN (a.shift_start - interval '1 hour') AND (a.shift_end + make_interval(mins => $1))
       ORDER BY a.shift_start ASC`,
      [outBufferMinutes]
    );

    const instances = result.rows.map(r => ({
      shift_code: r.shift_code,
      date: r.mapping_date.toISOString().slice(0, 10), // YYYY-MM-DD
      shift_start: new Date(r.shift_start).toISOString(),
      shift_end: new Date(r.shift_end).toISOString(),
      now_ist: new Date(r.nowts).toISOString()
    }));

    res.json({ success: true, data: instances, meta: { timezone: 'Asia/Kolkata', outBufferMinutes } });
  } catch (error) {
    console.error('Error determining current shift instances:', error);
    res.status(500).json({ success: false, message: 'Internal error determining current shift', error: error.message });
  }
};

// GET /api/attendance/recent-shift-instances?days=1&outBufferMinutes=240
// Returns shift instances for today and previous N days (default 1),
// includes only instances where at least one employee is mapped.
export const getRecentShiftInstances = async (req, res) => {
  try {
    const outBufferMinutes = parseOutBuffer(req.query.outBufferMinutes, 240);
    const days = Math.max(0, Math.min(7, Number(req.query.days) || 1));
    const result = await pool.query(
      `WITH params AS (
         SELECT (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata') AS nowts,
                (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata')::date AS today,
                $1::int AS days,
                $2::int AS out_mins
       ),
       dates AS (
         SELECT generate_series((SELECT today - make_interval(days => days) FROM params),
                                 (SELECT today FROM params),
                                 interval '1 day')::date AS d
       ),
       base AS (
         SELECT s.shift_code, s.start_time, s.end_time, d.d AS mapping_date
         FROM shifts s
         CROSS JOIN dates d
         WHERE s.start_time IS NOT NULL AND s.end_time IS NOT NULL
       ),
       bounds AS (
         SELECT shift_code, mapping_date,
                (mapping_date + start_time) AS shift_start,
                CASE WHEN end_time >= start_time THEN (mapping_date + end_time)
                     ELSE ((mapping_date + interval '1 day') + end_time) END AS shift_end
         FROM base
       ),
       counts AS (
         SELECT b.shift_code, b.mapping_date, b.shift_start, b.shift_end,
                COUNT(sm.emp_code)::int AS mapped_count
         FROM bounds b
         LEFT JOIN shiftmapping sm
           ON sm.date = b.mapping_date AND sm.shift_code = b.shift_code
         GROUP BY b.shift_code, b.mapping_date, b.shift_start, b.shift_end
       ),
       ist AS (SELECT nowts, out_mins FROM params)
       SELECT c.shift_code,
              c.mapping_date,
              c.shift_start,
              c.shift_end,
              c.mapped_count,
              (i.nowts BETWEEN (c.shift_start - interval '1 hour') AND (c.shift_end + make_interval(mins => i.out_mins))) AS is_active,
              i.nowts
       FROM counts c CROSS JOIN ist i
       WHERE c.mapped_count > 0
       ORDER BY c.mapping_date DESC, c.shift_start DESC` ,
      [days, outBufferMinutes]
    );

    const items = result.rows.map(r => ({
      shift_code: r.shift_code,
      date: r.mapping_date.toISOString().slice(0, 10),
      shift_start: new Date(r.shift_start).toISOString(),
      shift_end: new Date(r.shift_end).toISOString(),
      mapped_count: r.mapped_count,
      is_active: r.is_active,
      now_ist: new Date(r.nowts).toISOString()
    }));

    res.json({ success: true, data: items, meta: { timezone: 'Asia/Kolkata', outBufferMinutes, days } });
  } catch (error) {
    console.error('Error loading recent shift instances:', error);
    res.status(500).json({ success: false, message: 'Internal error loading recent shift instances', error: error.message });
  }
};
