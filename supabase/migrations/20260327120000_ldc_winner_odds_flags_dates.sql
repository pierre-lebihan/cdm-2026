-- LDC: cotes vainqueur, codes drapeaux (fichiers dans assets/flags), dates (verrou = 1er quart)

UPDATE competitions SET
  launch_bet = TIMESTAMPTZ '2026-01-01 00:00:00+00',
  start_date = TIMESTAMPTZ '2026-04-08 19:00:00+00'
WHERE name = 'Ligue des champions 2024-25';

UPDATE teams SET code = 'arsenal', win_odd = 7.0 WHERE id = 'cl-arsenal';
UPDATE teams SET code = 'realmadrid', win_odd = 5.5 WHERE id = 'cl-realmadrid';
UPDATE teams SET code = 'psg', win_odd = 6.0 WHERE id = 'cl-psg';
UPDATE teams SET code = 'astonvilla', win_odd = 22.0 WHERE id = 'cl-astonvilla';
UPDATE teams SET code = 'barcelona', win_odd = 7.5 WHERE id = 'cl-barcelona';
UPDATE teams SET code = 'dort', win_odd = 15.0 WHERE id = 'cl-dortmund';
UPDATE teams SET code = 'bay', win_odd = 5.5 WHERE id = 'cl-bayern';
UPDATE teams SET code = 'inter', win_odd = 12.0 WHERE id = 'cl-inter';

UPDATE matches SET date_time = TIMESTAMPTZ '2026-04-08 19:00:00+00' WHERE id = 'ucl25-qf1-l1';
UPDATE matches SET date_time = TIMESTAMPTZ '2026-04-15 19:00:00+00' WHERE id = 'ucl25-qf1-l2';
UPDATE matches SET date_time = TIMESTAMPTZ '2026-04-09 19:00:00+00' WHERE id = 'ucl25-qf2-l1';
UPDATE matches SET date_time = TIMESTAMPTZ '2026-04-15 20:00:00+00' WHERE id = 'ucl25-qf2-l2';
UPDATE matches SET date_time = TIMESTAMPTZ '2026-04-09 19:00:00+00' WHERE id = 'ucl25-qf3-l1';
UPDATE matches SET date_time = TIMESTAMPTZ '2026-04-15 19:00:00+00' WHERE id = 'ucl25-qf3-l2';
UPDATE matches SET date_time = TIMESTAMPTZ '2026-04-08 19:00:00+00' WHERE id = 'ucl25-qf4-l1';
UPDATE matches SET date_time = TIMESTAMPTZ '2026-04-16 19:00:00+00' WHERE id = 'ucl25-qf4-l2';
