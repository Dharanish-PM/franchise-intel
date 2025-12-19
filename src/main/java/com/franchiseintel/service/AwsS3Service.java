package com.franchiseintel.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.zip.GZIPInputStream;

@Slf4j
@Service
public class AwsS3Service {

    private final S3Client s3Client;
    private final ObjectMapper objectMapper;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public AwsS3Service(S3Client s3Client, ObjectMapper objectMapper) {
        this.s3Client = s3Client;
        this.objectMapper = objectMapper;
    }

    public <T> T fetchAndDeserializeGzipFile(String fileName, TypeReference<T> typeReference) throws IOException {
        log.info("Fetching file from S3: s3://{}/{}", bucketName, fileName);

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();

        byte[] fileContent = s3Client.getObject(getObjectRequest).readAllBytes();
        
        try (GZIPInputStream gzipInputStream = new GZIPInputStream(new ByteArrayInputStream(fileContent))) {
            byte[] decompressed = IOUtils.toByteArray(gzipInputStream);
            String jsonContent = new String(decompressed);
            return objectMapper.readValue(jsonContent, typeReference);
        }
    }
}