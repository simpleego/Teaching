package com.bookstore.book.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;

import java.net.MalformedURLException;


@Controller
public class ImageController {
    @Value("${file.upload-dir}")
    private String uploadDir;

    @GetMapping("/images/{filename}")
    @ResponseBody // HTML 뷰를 통하지 않고, 응답 본문에 직접 데이터를 씀
    public Resource showImage(@PathVariable String filename) throws MalformedURLException {

        System.out.println("Show Image filename: " + filename);
        // "file:/C:/uploads/filename.jpg" 와 같은 형식으로 리소스 경로를 만듦
        return new UrlResource("file:" + uploadDir + filename);
    }
}
