-- LDC 2025-26 : mise à jour des demi-finales avec les vrais qualifiés et visibilité activée.
-- SF1 : PSG vs Bayern Munich | SF2 : Atlético Madrid vs Arsenal

-- SF1 - Aller : PSG (domicile) vs Bayern Munich — 28 avril 2026, Paris
UPDATE matches SET
  date_time     = TIMESTAMPTZ '2026-04-28 21:00:00+02',
  city          = 'Paris',
  team_a        = 'cl-psg',
  team_b        = 'cl-bayern',
  tournament_phase = 'semi_final',
  visible_to_users = true,
  odds_a        = 2.00,
  odds_b        = 3.40,
  odds_draw     = 3.60
WHERE id = 'ucl25-sf1-l1';

-- SF1 - Retour : Bayern Munich (domicile) vs PSG — 6 mai 2026, Munich
UPDATE matches SET
  date_time     = TIMESTAMPTZ '2026-05-06 21:00:00+02',
  city          = 'Munich',
  team_a        = 'cl-bayern',
  team_b        = 'cl-psg',
  tournament_phase = 'semi_final',
  visible_to_users = true,
  odds_a        = 2.30,
  odds_b        = 3.00,
  odds_draw     = 3.50
WHERE id = 'ucl25-sf1-l2';

-- SF2 - Aller : Atlético Madrid (domicile) vs Arsenal — 29 avril 2026, Madrid
UPDATE matches SET
  date_time     = TIMESTAMPTZ '2026-04-29 21:00:00+02',
  city          = 'Madrid',
  team_a        = 'cl-dortmund',
  team_b        = 'cl-arsenal',
  tournament_phase = 'semi_final',
  visible_to_users = true,
  odds_a        = 2.50,
  odds_b        = 2.80,
  odds_draw     = 3.30
WHERE id = 'ucl25-sf2-l1';

-- SF2 - Retour : Arsenal (domicile) vs Atlético Madrid — 7 mai 2026, Londres
UPDATE matches SET
  date_time     = TIMESTAMPTZ '2026-05-07 21:00:00+02',
  city          = 'Londres',
  team_a        = 'cl-arsenal',
  team_b        = 'cl-dortmund',
  tournament_phase = 'semi_final',
  visible_to_users = true,
  odds_a        = 2.10,
  odds_b        = 3.60,
  odds_draw     = 3.50
WHERE id = 'ucl25-sf2-l2';
