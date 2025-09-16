package com.geminifromexam.service;

import com.google.cloud.vertexai.VertexAI;
import com.google.cloud.vertexai.api.GenerateContentResponse;
import com.google.cloud.vertexai.generativeai.GenerativeModel;
import com.google.cloud.vertexai.generativeai.ResponseHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiService {
    @Value("${google.api.key}")
    private String apiKey;

    public String generateQuestion(String subject, int numOptions) throws IOException {
        String prompt = String.format(
                "다음 주제에 대해 4지 선다형 객관식 문제를 하나 생성해줘. 문제, 보기 4개, 그리고 정답을 포함해. " +
                        "형식은 다음과 같이 엄격하게 지켜줘:\n\n" +
                        "문제: [문제 내용]\n" +
                        "1. [보기 1]\n" +
                        "2. [보기 2]\n" +
                        "3. [보기 3]\n" +
                        "4. [보기 4]\n" +
                        "정답: [정답 보기 번호]",
                subject
        );

        try (VertexAI vertexAI = new VertexAI("your-project-id", "us-central1")) { // "your-project-id"와 "us-central1"을 자신의 프로젝트 ID와 리전으로 대체하세요.
            GenerativeModel model = new GenerativeModel("gemini-1.0-pro", vertexAI);

            GenerateContentResponse response = model.generateContent(prompt);
            return ResponseHandler.getText(response);
        }
    }
}