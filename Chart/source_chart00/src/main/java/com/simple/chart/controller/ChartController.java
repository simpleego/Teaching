package com.simple.chart.controller;


import com.simple.chart.model.ChartData;
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

    // 차트 데이터 API
    @GetMapping("/api/chart-data")
    public ChartData getChartData() {
        List<String> labels = Arrays.asList("1월", "2월", "3월", "4월", "5월", "6월");
        List<Integer> values = Arrays.asList(65, 59, 80, 81, 56, 55);
        String title = "2023년 상반기 판매량";

        return new ChartData(labels, values, title);
    }

    // 다른 유형의 차트 데이터
    @GetMapping("/api/pie-chart-data")
    public ChartData getPieChartData() {
        List<String> labels = Arrays.asList("Red", "Blue", "Yellow", "Green", "Purple", "Orange");
        List<Integer> values = Arrays.asList(12, 19, 3, 5, 2, 3);
        String title = "색상 분포";

        return new ChartData(labels, values, title);
    }
}
