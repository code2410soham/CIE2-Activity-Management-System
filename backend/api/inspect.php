<?php
require_once __DIR__ . '/db.php';
$db = getDbConnection();

function inspectTable($db, $table)
{
    echo "--- Table: $table ---\n";
    $q = $db->query("DESCRIBE `$table`");
    while ($row = $q->fetch()) {
        echo $row['Field'] . " | " . $row['Type'] . "\n";
    }
}

inspectTable($db, 'users');
inspectTable($db, 'student_profiles');
inspectTable($db, 'departments');
inspectTable($db, 'semesters');
inspectTable($db, 'subjects');
inspectTable($db, 'activities');
inspectTable($db, 'submissions');
inspectTable($db, 'evaluations');
