package com.simple.bmi;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class BMICalculator extends JFrame {

    private JTextField heightField;
    private JTextField weightField;
    private JTextArea resultArea;

    public BMICalculator() {
        setTitle("BMI 계산기");
        setSize(350, 250);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout());

        // 입력 패널
        JPanel inputPanel = new JPanel(new GridLayout(2, 2));
        inputPanel.add(new JLabel("키(cm):"));
        heightField = new JTextField();
        inputPanel.add(heightField);

        inputPanel.add(new JLabel("몸무게(kg):"));
        weightField = new JTextField();
        inputPanel.add(weightField);

        add(inputPanel, BorderLayout.NORTH);

        // 결과 출력 영역
        resultArea = new JTextArea();
        resultArea.setEditable(false);
        add(new JScrollPane(resultArea), BorderLayout.CENTER);

        // 버튼
        JButton calcButton = new JButton("BMI 계산");
        add(calcButton, BorderLayout.SOUTH);

        // 버튼 이벤트
        calcButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                calculateBMI();
            }
        });

        //calcButton.addActionListener(e -> calculateBMI());

        setVisible(true);
    }

    private void calculateBMI() {
        try {
            double height = Double.parseDouble(heightField.getText().trim());
            double weight = Double.parseDouble(weightField.getText().trim());

            if (height <= 0 || weight <= 0) {
                throw new IllegalArgumentException("키와 몸무게는 0보다 커야 합니다.");
            }

            // BMI 계산
            double heightMeter = height / 100.0;
            double bmi = weight / (heightMeter * heightMeter);

            // 비만도 판정
            String status;
            if (bmi < 18.5) status = "저체중";
            else if (bmi < 23) status = "정상";
            else if (bmi < 25) status = "과체중";
            else status = "비만";

            // 결과 출력
            resultArea.setText("");
            resultArea.append("BMI 지수: " + String.format("%.2f", bmi) + "\n");
            resultArea.append("비만도 판정: " + status + "\n");

        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "숫자를 정확히 입력하세요.");
        } catch (IllegalArgumentException ex) {
            JOptionPane.showMessageDialog(this, ex.getMessage());
        }
    }

    public static void main(String[] args) {
        new BMICalculator();
    }
}