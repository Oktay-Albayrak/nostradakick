-- @pgsql Chat Query Editor (localhost)

-- Nombre total de compétitions
SELECT COUNT(*) as total_competitions FROM competition;

-- Nombre total d'équipes
SELECT COUNT(*) as total_teams FROM team;

-- Nombre total de matchs
SELECT COUNT(*) as total_matches FROM match;

-- Résumé global
SELECT 
  (SELECT COUNT(*) FROM competition) as competitions,
  (SELECT COUNT(*) FROM team) as teams,
  (SELECT COUNT(*) FROM match) as matches;

  -- Matchs de la Ligue 1
SELECT 
  m.date,
  m.status,
  ht.name as equipe_domicile,
  m.home_score,
  m.away_score,
  at.name as equipe_exterieur,
  c.name as competition
FROM match m
JOIN team ht ON m.home_team_id = ht.id
JOIN team at ON m.away_team_id = at.id
JOIN competition c ON m.competition_id = c.id
WHERE c.code = 'FL1'
ORDER BY m.date DESC
LIMIT 20;

  -- Matchs de toutes les ligues
SELECT 
  m.date,
  m.status,
  ht.name as equipe_domicile,
  m.home_score,
  m.away_score,
  at.name as equipe_exterieur,
  c.name as competition
FROM match m
JOIN team ht ON m.home_team_id = ht.id
JOIN team at ON m.away_team_id = at.id
JOIN competition c ON m.competition_id = c.id
ORDER BY m.date DESC
LIMIT 2000;

  -- Liste des compétitions avec nombre de matchs
SELECT 
  c.name,
  c.code,
  c.country,
  COUNT(m.id) as nb_matches
FROM competition c
LEFT JOIN match m ON m.competition_id = c.id
GROUP BY c.id, c.name, c.code, c.country
ORDER BY nb_matches DESC;

-- Les 50 derniers matchs synchronisés
SELECT 
  m.date,
  c.code as ligue,
  ht.name as domicile,
  m.home_score,
  m.away_score,
  at.name as exterieur,
  m.status
FROM match m
JOIN team ht ON m.home_team_id = ht.id
JOIN team at ON m.away_team_id = at.id
JOIN competition c ON m.competition_id = c.id
ORDER BY m.created_at DESC
LIMIT 50;

-- Nombre de matchs par statut
SELECT 
  status,
  COUNT(*) as nombre
FROM match
GROUP BY status
ORDER BY nombre DESC;

-- Nombre de matchs par statut et par compétition
SELECT 
  c.code as ligue,
  m.status,
  COUNT(*) as nombre
FROM match m
JOIN competition c ON m.competition_id = c.id
GROUP BY c.code, m.status
ORDER BY c.code, nombre DESC;

-- Prochains matchs (SCHEDULED ou TIMED)
SELECT 
  m.date,
  c.name as competition,
  ht.name as domicile,
  at.name as exterieur,
  m.status
FROM match m
JOIN team ht ON m.home_team_id = ht.id
JOIN team at ON m.away_team_id = at.id
JOIN competition c ON m.competition_id = c.id
WHERE m.status IN ('SCHEDULED', 'TIMED')
  AND m.date > now()
ORDER BY m.date ASC
LIMIT 20;

-- Matchs terminés avec résultats
SELECT 
  m.date,
  c.code as ligue,
  ht.name as domicile,
  m.home_score,
  m.away_score,
  at.name as exterieur
FROM match m
JOIN team ht ON m.home_team_id = ht.id
JOIN team at ON m.away_team_id = at.id
JOIN competition c ON m.competition_id = c.id
WHERE m.status = 'FINISHED'
  AND m.home_score IS NOT NULL
  AND m.away_score IS NOT NULL
ORDER BY m.date DESC
LIMIT 30;

-- Dernière synchronisation (via created_at des matchs)
SELECT 
  MAX(created_at) as derniere_sync,
  COUNT(*) as matchs_syncs_aujourd_hui
FROM match
WHERE created_at >= CURRENT_DATE;

-- Dernières données ajoutées
SELECT 
  'Compétition' as type,
  name,
  created_at
FROM competition
ORDER BY created_at DESC
LIMIT 5

SELECT 
  'Match' as type,
  CONCAT(
    (SELECT name FROM team WHERE id = home_team_id),
    ' vs ',
    (SELECT name FROM team WHERE id = away_team_id)
  ),
  created_at
FROM match
ORDER BY created_at DESC
LIMIT 5;

-- Vérifier les doublons de matchs (via api_id)
SELECT 
  api_id,
  COUNT(*) as nb_doublons
FROM match
GROUP BY api_id
HAVING COUNT(*) > 1;

-- Vérifier les doublons de compétitions
SELECT 
  code,
  COUNT(*) as nb_doublons
FROM competition
GROUP BY code
HAVING COUNT(*) > 1;

-- DASHBOARD COMPLET
SELECT 
  '=== RÉSUMÉ GÉNÉRAL ===' as info
UNION ALL
SELECT CONCAT('Compétitions: ', COUNT(*)) FROM competition
UNION ALL
SELECT CONCAT('Équipes: ', COUNT(*)) FROM team
UNION ALL
SELECT CONCAT('Matchs: ', COUNT(*)) FROM match
UNION ALL
SELECT '=== PAR COMPÉTITION ===' as info
UNION ALL
SELECT CONCAT(c.code, ': ', COUNT(m.id), ' matchs')
FROM competition c
LEFT JOIN match m ON m.competition_id = c.id
GROUP BY c.code, c.name
UNION ALL
SELECT '=== PAR STATUT ===' as info
UNION ALL
SELECT CONCAT(status, ': ', COUNT(*))
FROM match
GROUP BY status
ORDER BY info;

-- Dates des matchs pour voir la plage
SELECT 
  c.code,
  MIN(m.date) as premier_match,
  MAX(m.date) as dernier_match,
  COUNT(*) as nb_matchs
FROM match m
JOIN competition c ON m.competition_id = c.id
GROUP BY c.code
ORDER BY c.code;