package com.simple.chart.model;

import java.util.List;

public class ChartData {
    private List<String> labels;
    private List<Integer> values;
    private String title;

    public ChartData() {}

    public ChartData(List<String> labels, List<Integer> values, String title) {
        this.labels = labels;
        this.values = values;
        this.title = title;
    }

    // Getters and Setters
    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    public List<Integer> getValues() {
        return values;
    }

    public void setValues(List<Integer> values) {
        this.values = values;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}