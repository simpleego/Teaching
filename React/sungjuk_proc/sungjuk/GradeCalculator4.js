import React, { useState, useEffect, useMemo, useCallback } from 'react';

// 학점 계산 함수 (유틸리티)
// useEffect, useMemo, useCallback 사용

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
  // 초기 학생 데이터 (5명) - useMemo는 이제 localStorage 로딩 실패 시의 기본값 역할도 겸함
  const initialStudentsDefaultData = useMemo(() => ([
    { id: 1, name: '학생1', korean: 0, english: 0, math: 0 },
    { id: 2, name: '학생2', korean: 0, english: 0, math: 0 },
    { id: 3, name: '학생3', korean: 0, english: 0, math: 0 },
    { id: 4, name: '학생4', korean: 0, english: 0, math: 0 },
    { id: 5, name: '학생5', korean: 0, english: 0, math: 0 },
  ]), []);

  // ⭐⭐⭐ students 상태 초기화에 localStorage 로딩 로직 추가 ⭐⭐⭐
  const [students, setStudents] = useState(() => {
    const savedStudents = localStorage.getItem('gradeCalculatorStudents');
    return savedStudents ? JSON.parse(savedStudents) : initialStudentsDefaultData;
  });

  // ⭐⭐⭐ useEffect를 사용하여 students 상태가 변경될 때마다 localStorage에 저장 ⭐⭐⭐
  useEffect(() => {
    localStorage.setItem('gradeCalculatorStudents', JSON.stringify(students));
    // 이펙트 실행: students 배열이 변경될 때마다 실행됨
    console.log("학생 성적 데이터가 localStorage에 저장되었습니다."); // 개발자 도구에서 확인 가능!
  }, [students]); // students 배열이 의존성으로, students가 변경될 때마다 이펙트가 재실행됨.

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

  // 특정 과목 점수 랜덤 채우기
  const fillRandomScoresBySubject = useCallback((subject) => {
    setStudents(prevStudents =>
      prevStudents.map(student => ({
        ...student,
        [subject]: Math.floor(Math.random() * 101), // 0부터 100까지 랜덤 점수
      }))
    );
  }, []);

  // 모든 과목 점수 랜덤 채우기
  const fillAllRandomScores = useCallback(() => {
    setStudents(prevStudents =>
      prevStudents.map(student => ({
        ...student,
        korean: Math.floor(Math.random() * 101),
        english: Math.floor(Math.random() * 101),
        math: Math.floor(Math.random() * 101),
      }))
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
      <h2>📝 학생 성적 관리 프로그램 (useEffect 적용)</h2>
      <p>
        튼튼한젤리7889님, 이제 학점, 등수는 실시간! 표준편차는 살짝 지연돼요. <br/>
        **🎉 학생 성적 데이터가 브라우저에 저장되어서 새로고침해도 유지됩니다! (useEffect 적용)**
      </p>

      <div style={{ marginBottom: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={fillAllRandomScores} style={buttonStyle}>
          🔄 모든 과목 점수 랜덤 채우기
        </button>
        <button onClick={() => fillRandomScoresBySubject('korean')} style={buttonStyle}>
          📚 국어 점수 랜덤 채우기
        </button>
        <button onClick={() => fillRandomScoresBySubject('english')} style={buttonStyle}>
          🔠 영어 점수 랜덤 채우기
        </button>
        <button onClick={() => fillRandomScoresBySubject('math')} style={buttonStyle}>
          ➕ 수학 점수 랜덤 채우기
        </button>
      </div>

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

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>🏆 등수별 학생 명단</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {studentsSortedByRank.map((student) => (
            <li key={student.id} style={{ marginBottom: '5px', fontSize: '1.05em' }}>
              <strong>{student.rank}등:</strong> {student.name} (총점: {student.total}, 평균: {student.average.toFixed(2)})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '8px 15px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  backgroundColor: '#f9f9f9',
  cursor: 'pointer',
  fontSize: '0.9em',
  whiteSpace: 'nowrap', 
};

export default GradeCalculator;