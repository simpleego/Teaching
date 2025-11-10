package com.simple.chart.controller;


import com.simple.chart.model.ChartData;
import com.simple.chart.model.StackedChartData;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import java.util.Arrays;
import java.util.List;

@RestController
public class ChartController {

    // 기본 페이지
    @RequestMapping("/")
    public ModelAndView index() {
        return new ModelAndView("index");
    }

    // 막대 그래프 데이터
    @GetMapping("/api/chart-data")
    public ChartData getChartData() {
        List<String> labels = Arrays.asList("1월", "2월", "3월", "4월", "5월", "6월");
        List<Integer> values = Arrays.asList(65, 59, 80, 81, 56, 55);
        String title = "2023년 상반기 판매량";

        return new ChartData(labels, values, title);
    }

    // 원형 그래프 데이터
    @GetMapping("/api/pie-chart-data")
    public ChartData getPieChartData() {
        List<String> labels = Arrays.asList("Red", "Blue", "Yellow", "Green", "Purple", "Orange");
        List<Integer> values = Arrays.asList(12, 19, 3, 5, 2, 3);
        String title = "색상 분포";

        return new ChartData(labels, values, title);
    }

    // 선 그래프 데이터
    @GetMapping("/api/line-chart-data")
    public ChartData getLineChartData() {
        List<String> labels = Arrays.asList("1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월");
        List<Integer> values = Arrays.asList(65, 59, 80, 81, 56, 55, 70, 75, 82, 78, 85, 90);
        String title = "2023년 월별 방문자 수";

        return new ChartData(labels, values, title);
    }

    // 다중 선 그래프 데이터
    @GetMapping("/api/multi-line-chart-data")
    public StackedChartData getMultiLineChartData() {
        List<String> labels = Arrays.asList("1월", "2월", "3월", "4월", "5월", "6월");

        List<StackedChartData.Dataset> datasets = Arrays.asList(
                new StackedChartData.Dataset(
                        "제품 A",
                        Arrays.asList(30, 45, 60, 50, 70, 65),
                        "rgba(255, 99, 132, 0.7)"
                ),
                new StackedChartData.Dataset(
                        "제품 B",
                        Arrays.asList(20, 35, 40, 45, 30, 50),
                        "rgba(54, 162, 235, 0.7)"
                ),
                new StackedChartData.Dataset(
                        "제품 C",
                        Arrays.asList(15, 25, 35, 30, 40, 45),
                        "rgba(255, 206, 86, 0.7)"
                )
        );

        return new StackedChartData(labels, datasets, "2023년 상반기 제품별 판매량");
    }

    // 누적 막대 그래프 데이터
    @GetMapping("/api/stacked-bar-chart-data")
    public StackedChartData getStackedBarChartData() {
        List<String> labels = Arrays.asList("1분기", "2분기", "3분기", "4분기");

        List<StackedChartData.Dataset> datasets = Arrays.asList(
                new StackedChartData.Dataset(
                        "온라인 판매",
                        Arrays.asList(120, 150, 180, 200),
                        "rgba(255, 99, 132, 0.7)"
                ),
                new StackedChartData.Dataset(
                        "오프라인 판매",
                        Arrays.asList(80, 100, 120, 140),
                        "rgba(54, 162, 235, 0.7)"
                ),
                new StackedChartData.Dataset(
                        "모바일 판매",
                        Arrays.asList(60, 80, 100, 120),
                        "rgba(75, 192, 192, 0.7)"
                )
        );

        return new StackedChartData(labels, datasets, "2023년 분기별 판매 채널");
    }
}