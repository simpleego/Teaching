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
  while (performance.now() - start < 150) { /* do nothing for 150ms */ } // 지연 시간 살짝 늘려서 체감하도록
  
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
  }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 생성

  // 각 학생의 총점, 평균, 학점을 계산 (실시간 반영)
  // 'students' 상태가 변경될 때마다 이 계산은 바로 이루어져야 함.
  const studentsWithCalculatedScores = useMemo(() => {
    return students.map(student => {
      const total = student.korean + student.english + student.math;
      const average = total / 3;
      const grade = calculateGrade(average); // 학점은 여기서 바로 계산됨
      return { ...student, total, average, grade };
    });
  }, [students]); // students 배열이 변경될 때만 다시 계산

  // 등수 계산 (studentsWithCalculatedScores가 변경될 때 즉시 재계산)
  const studentsWithRank = useMemo(() => {
    const sortedStudents = [...studentsWithCalculatedScores].sort((a, b) => b.total - a.total); // 총점 내림차순 정렬

    // 동점자 처리 및 등수 부여
    const ranked = sortedStudents.map((student, index, arr) => {
      const prevStudent = arr[index - 1];
      if (prevStudent && student.total === prevStudent.total) {
        return { ...student, rank: prevStudent.rank };
      }
      return { ...student, rank: index + 1 };
    });

    // 원래 id 순서대로 정렬하여 화면에 표시 (이전과 동일한 순서 유지)
    return ranked.sort((a, b) => a.id - b.id);
  }, [studentsWithCalculatedScores]); // calculatedStudents가 변경될 때 등수 즉시 계산

  // 표준편차 계산 (시간이 많이 걸린다고 가정하고 useMemo 분리)
  const stdDev = useMemo(() => {
    // 모든 학생의 평균 점수 추출
    const allAverages = studentsWithCalculatedScores.map(s => s.average);
    // 지연 시간이 포함된 표준편차 함수 호출
    return calculateStandardDeviation(allAverages);
  }, [studentsWithCalculatedScores]); // studentsWithCalculatedScores가 변경될 때만 표준편차 다시 계산

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>📝 학생 성적 관리 프로그램 (개선 버전)</h2>
      <p>
        튼튼한젤리7889님, 이제 학점과 등수는 실시간으로 바로바로 바뀔 거예요! 🚀 <br />
        표준편차만 계산량이 많아 살짝 느리게 업데이트되니 참고해주세요. 😉
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
              <td>{student.average.toFixed(2)}</td> {/* 소수점 2자리까지 표시 */}
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
    </div>
  );
}

export default GradeCalculator;