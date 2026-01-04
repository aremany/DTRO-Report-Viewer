const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8003;

// --- 설정 --- //
// 상위 폴더의 DB 참조
let DB_PATH = path.join(__dirname, '..', 'incident_reports.db');
if (!fs.existsSync(DB_PATH)) {
    // 현재 폴더 확인
    DB_PATH = path.join(__dirname, 'incident_reports.db');
}

console.log(`[INFO] 데이터베이스 경로: ${DB_PATH}`);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API --- //

// 1. 장애 목록 조회
app.get('/api/faults', (req, res) => {
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'DB 연결 실패' });
        }
    });

    const sql = "SELECT `순번` as id, `장애명` as fault_type, `장애일시` as fault_datetime, `장애 장소` as location, `장애 원인` as cause, `risk_level` FROM incident_data ORDER BY `장애일시` DESC";
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: '데이터 조회 실패' });
        } else {
            res.json(rows);
        }
    });
    db.close();
});

// 2. 장애 상세 조회
app.get('/api/faults/:id', (req, res) => {
    const id = req.params.id;
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);
    
    const sql = "SELECT * FROM incident_data WHERE `순번` = ?";
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: '상세 조회 실패' });
        } else if (!row) {
            res.status(404).json({ error: '해당 장애를 찾을 수 없습니다.' });
        } else {
            res.json({
                id: row['순번'],
                fault_type: row['장애명'],
                fault_datetime: row['장애일시'],
                location: row['장애 장소'],
                cause: row['장애 원인'],
                symptom: row['장애 발생 시 현상'],
                action: row['장애 발생 시 조치 방법'],
                raw_text: row['원본_추출텍스트']
            });
        }
    });
    db.close();
});

// --- 서버 시작 --- //
app.listen(PORT, () => {
    console.log(`독립형 장애보고서 호출기가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
