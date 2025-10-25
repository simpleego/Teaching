import React, { useState, useEffect, useMemo, useCallback } from 'react';

// 학점 계산 함수 (유틸리티)
const calculateGrade = (average) => {
  if (average >= 90) return 'A';
  if (average >= 80) return 'B';
  if (average >= 70) return 'C';
  if (average >= 60) return 'D';
  return 'F';
};

// 표준편차 계산 함수 (시간이 많이 걸린다고 가정)
const calculateStandardDeviation = (scores) => {
  if (scores.length === 0) return 0;
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  
  // 계산이 복잡하고 오래 걸린다고 가정하기 위해 일부러 지연 추가 (실제 사용 시에는 제거)
  let start = performance.now();
  while (performance.now() - start < 150) { /* do nothing for 150ms */ } 
  
  return Math.sqrt(variance);
};

function GradeCalculator() {
  // 초기 학생 데이터 (5명)
  const initialStudentsData = useMemo(() => ([
    { id: 1, name: '학생1', korean: 0, english: 0, math: 0 },
    { id: 2, name: '학생2', korean: 0, english: 0, math: 0 },
    { id: 3, name: '학생3', korean: 0, english: 0, math: 0 },
    { id: 4, name: '학생4', korean: 0, english: 0, math: 0 },
    { id: 5, name: '학생5', korean: 0, english: 0, math: 0 },
  ]), []);

  const [students, setStudents] = useState(initialStudentsData);

  // 성적 입력 변경 핸들러
  const handleScoreChange = useCallback((id, subject, value) => {
    // 숫자로 변환하고, 0~100 범위로 제한
    const score = Math.max(0, Math.min(100, Number(value)));

    setStudents(prevStudents =>
      prevStudents.map(student =>
        student.id === id ? { ...student, [subject]: score } : student
      )
    );
  }, []); 

  // 각 학생의 총점, 평균, 학점을 계산 (실시간 반영)
  const studentsWithCalculatedScores = useMemo(() => {
    return students.map(student => {
      const total = student.korean + student.english + student.math;
      const average = total / 3;
      const grade = calculateGrade(average); 
      return { ...student, total, average, grade };
    });
  }, [students]); 

  // 등수 계산 (studentsWithCalculatedScores가 변경될 때 즉시 재계산)
  const studentsWithRank = useMemo(() => {
    const sortedStudents = [...studentsWithCalculatedScores].sort((a, b) => b.total - a.total); 

    // 동점자 처리 및 등수 부여
    const ranked = sortedStudents.map((student, index, arr) => {
      const prevStudent = arr[index - 1];
      if (prevStudent && student.total === prevStudent.total) {
        return { ...student, rank: prevStudent.rank };
      }
      return { ...student, rank: index + 1 };
    });

    // 테이블 표시는 원래 id 순서대로 유지하되, 등수 정보는 포함
    return ranked.sort((a, b) => a.id - b.id);
  }, [studentsWithCalculatedScores]); 

  // 표준편차 계산 (시간이 많이 걸린다고 가정하고 useMemo 분리)
  const stdDev = useMemo(() => {
    const allAverages = studentsWithCalculatedScores.map(s => s.average);
    return calculateStandardDeviation(allAverages);
  }, [studentsWithCalculatedScores]); 

  // 등수 순으로 정렬된 학생 명단
  const studentsSortedByRank = useMemo(() => {
    return [...studentsWithRank].sort((a, b) => {
      if (a.rank === b.rank) {
        return a.name.localeCompare(b.name); 
      }
      return a.rank - b.rank;
    });
  }, [studentsWithRank]);


  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>📝 학생 성적 관리 프로그램 (평균 추가)</h2>
      <p>
        튼튼한젤리7889님, 이제 학점과 등수는 실시간으로 바로바로 바뀔 거예요! 🚀 <br />
        표준편차만 계산량이 많아 살짝 느리게 업데이트되니 참고해주세요.
      </p>

      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>이름</th>
            <th>국어</th>
            <th>영어</th>
            <th>수학</th>
            <th>총점</th>
            <th>평균</th>
            <th>학점</th>
            <th>등수</th>
          </tr>
        </thead>
        <tbody>
          {studentsWithRank.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={student.korean}
                  onChange={(e) => handleScoreChange(student.id, 'korean', e.target.value)}
                  style={{ width: '60px', textAlign: 'center' }}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={student.english}
                  onChange={(e) => handleScoreChange(student.id, 'english', e.target.value)}
                  style={{ width: '60px', textAlign: 'center' }}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={student.math}
                  onChange={(e) => handleScoreChange(student.id, 'math', e.target.value)}
                  style={{ width: '60px', textAlign: 'center' }}
                />
              </td>
              <td>{student.total}</td>
              <td>{student.average.toFixed(2)}</td> 
              <td>{student.grade}</td>
              <td>{student.rank}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '20px', fontSize: '1.1em', fontWeight: 'bold' }}>
        전체 학생 평균 점수의 표준편차: {stdDev.toFixed(2)}
      </div>
      <p style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
        * 표준편차는 계산량이 많아 useMemo로 최적화되었으며, 의도적으로 지연을 주었습니다.
      </p>

      {/* ⭐⭐⭐ 추가된 기능: 등수별 학생 명단 ⭐⭐⭐ */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>🏆 등수별 학생 명단</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {studentsSortedByRank.map((student) => (
            <li key={student.id} style={{ marginBottom: '5px', fontSize: '1.05em' }}>
              {/* <!-- ⭐⭐⭐ 수정된 부분 ⭐⭐⭐ --> */}
              <strong>{student.rank}등:</strong> {student.name} (총점: {student.total}, 평균: {student.average.toFixed(2)})
            </li>
          ))}
        </ul>
      </div>
      {/* ⭐⭐⭐ 추가된 기능 끝 ⭐⭐⭐ */}
    </div>
  );
}

export default GradeCalculator;