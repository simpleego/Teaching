package com.simple.chart.model;

import java.util.List;
import java.util.Map;

public class StackedChartData {
    private List<String> labels;
    private List<Dataset> datasets;
    private String title;

    public StackedChartData() {}

    public StackedChartData(List<String> labels, List<Dataset> datasets, String title) {
        this.labels = labels;
        this.datasets = datasets;
        this.title = title;
    }

    // 내부 Dataset 클래스
    public static class Dataset {
        private String label;
        private List<Integer> data;
        private String backgroundColor;

        public Dataset() {}

        public Dataset(String label, List<Integer> data, String backgroundColor) {
            this.label = label;
            this.data = data;
            this.backgroundColor = backgroundColor;
        }

        // Getters and Setters
        public String getLabel() {
            return label;
        }

        public void setLabel(String label) {
            this.label = label;
        }

        public List<Integer> getData() {
            return data;
        }

        public void setData(List<Integer> data) {
            this.data = data;
        }

        public String getBackgroundColor() {
            return backgroundColor;
        }

        public void setBackgroundColor(String backgroundColor) {
            this.backgroundColor = backgroundColor;
        }
    }

    // Getters and Setters
    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    public List<Dataset> getDatasets() {
        return datasets;
    }

    public void setDatasets(List<Dataset> datasets) {
        this.datasets = datasets;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
