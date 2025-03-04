-- Script to check for circular references in RLS policies
-- This script helps identify potential circular references in Row Level Security (RLS) policies

-- 1. Check all RLS policies for the profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual::text AS using_expression,
    with_check::text AS with_check_expression
FROM 
    pg_policies
WHERE 
    tablename = 'profiles'
ORDER BY 
    policyname;

-- 2. Check if any policy references the same table in its USING or WITH CHECK clause
-- This is a common cause of infinite recursion
WITH policy_references AS (
    SELECT 
        policyname,
        qual::text AS expression,
        'USING' AS clause_type
    FROM 
        pg_policies
    WHERE 
        tablename = 'profiles'
    UNION ALL
    SELECT 
        policyname,
        with_check::text AS expression,
        'WITH CHECK' AS clause_type
    FROM 
        pg_policies
    WHERE 
        tablename = 'profiles' AND with_check IS NOT NULL
)
SELECT 
    policyname,
    clause_type,
    expression,
    CASE 
        WHEN expression LIKE '%profiles%' THEN 'POTENTIAL CIRCULAR REFERENCE DETECTED'
        ELSE 'OK'
    END AS status
FROM 
    policy_references
ORDER BY 
    policyname, clause_type;

-- 3. Check for policies that might cause infinite recursion
-- These are policies that reference the same table in a way that could cause recursion
WITH recursive_policies AS (
    SELECT 
        policyname,
        qual::text AS expression
    FROM 
        pg_policies
    WHERE 
        tablename = 'profiles' AND
        qual::text ~ 'EXISTS.*SELECT.*FROM.*profiles'
)
SELECT 
    policyname,
    expression,
    'WARNING: Policy contains a subquery that references the profiles table' AS issue
FROM 
    recursive_policies;

-- 4. Check for policies that reference other tables with RLS enabled
-- This could cause cascading RLS evaluations
WITH cross_table_references AS (
    SELECT 
        p.policyname,
        p.tablename AS policy_table,
        t.tablename AS referenced_table,
        p.qual::text AS expression
    FROM 
        pg_policies p,
        pg_tables t
    WHERE 
        t.schemaname = 'public' AND
        p.tablename = 'profiles' AND
        p.qual::text LIKE '%' || t.tablename || '%' AND
        t.tablename != 'profiles'
)
SELECT 
    r.policyname,
    r.policy_table,
    r.referenced_table,
    r.expression,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_class c
            WHERE c.relname = r.referenced_table AND c.relrowsecurity
        ) THEN 'WARNING: References table with RLS enabled'
        ELSE 'OK'
    END AS status
FROM 
    cross_table_references r;

-- 5. Check for complex nested subqueries in policies
-- These can sometimes cause performance issues or unexpected behavior
SELECT 
    policyname,
    qual::text AS expression,
    (LENGTH(qual::text) - LENGTH(REPLACE(qual::text, 'SELECT', ''))) / 6 AS subquery_depth
FROM 
    pg_policies
WHERE 
    tablename = 'profiles' AND
    (LENGTH(qual::text) - LENGTH(REPLACE(qual::text, 'SELECT', ''))) / 6 > 1
ORDER BY 
    subquery_depth DESC;

-- 6. Check for policies that might be redundant or conflicting
WITH policy_pairs AS (
    SELECT 
        p1.policyname AS policy1,
        p2.policyname AS policy2,
        p1.cmd AS cmd1,
        p2.cmd AS cmd2,
        p1.qual::text AS qual1,
        p2.qual::text AS qual2
    FROM 
        pg_policies p1
    JOIN 
        pg_policies p2 ON p1.tablename = p2.tablename AND p1.policyname < p2.policyname
    WHERE 
        p1.tablename = 'profiles' AND
        p1.cmd = p2.cmd
)
SELECT 
    policy1,
    policy2,
    cmd1,
    CASE 
        WHEN qual1 = qual2 THEN 'DUPLICATE POLICIES'
        WHEN qual1 LIKE '%' || SUBSTRING(qual2 FROM 3) || '%' OR qual2 LIKE '%' || SUBSTRING(qual1 FROM 3) || '%' 
        THEN 'POTENTIALLY OVERLAPPING POLICIES'
        ELSE 'DISTINCT POLICIES'
    END AS relationship
FROM 
    policy_pairs;

-- 7. Recommendations for fixing circular references
SELECT 
    'If circular references are detected, consider the following solutions:' AS recommendations
UNION ALL
SELECT '1. Simplify policies to avoid self-references where possible'
UNION ALL
SELECT '2. Use direct comparisons (e.g., auth.uid() = id) instead of subqueries'
UNION ALL
SELECT '3. If admin checks are needed, consider using a separate admin_users table'
UNION ALL
SELECT '4. For complex authorization logic, consider using database functions instead of inline policy expressions'
UNION ALL
SELECT '5. Ensure that policies do not create circular dependencies between tables'; 