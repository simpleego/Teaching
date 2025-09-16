package com.geminifromexam.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class QuestionController {
    @Autowired
    private GeminiService geminiService;

    @Autowired
    private QuestionRepository questionRepository;

    @PostMapping("/generate-question")
    public Question generateAndSaveQuestion(@RequestParam String subject) {
        try {
            String rawResult = geminiService.generateQuestion(subject, 4);

            // API 응답 파싱
            Pattern questionPattern = Pattern.compile("문제:\\s*(.*?)\\s*1\\.");
            Pattern optionPattern = Pattern.compile("\\d\\.\\s*(.*?)(?=\\d\\.|정답:)");
            Pattern answerPattern = Pattern.compile("정답:\\s*(.*)");

            Matcher questionMatcher = questionPattern.matcher(rawResult);
            Matcher optionMatcher = optionPattern.matcher(rawResult);
            Matcher answerMatcher = answerPattern.matcher(rawResult);

            String questionContent = "";
            List<String> options = null;
            String answer = "";

            if (questionMatcher.find()) {
                questionContent = questionMatcher.group(1).trim();
            }

            if (optionMatcher.find()) {
                String optionsString = rawResult.substring(optionMatcher.start(), answerMatcher.start()).trim();
                options = Arrays.stream(optionsString.split("\\d\\."))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList());
            }

            if (answerMatcher.find()) {
                answer = answerMatcher.group(1).trim();
            }

            // 파싱된 데이터를 Question 엔티티에 저장
            Question newQuestion = new Question();
            newQuestion.setSubject(subject);
            newQuestion.setContent(questionContent);
            newQuestion.setOptions(options);
            newQuestion.setAnswer(answer);

            // 데이터베이스에 저장
            return questionRepository.save(newQuestion);

        } catch (Exception e) {
            e.printStackTrace();
            // 에러 처리 로직
            return null;
        }
    }
}
