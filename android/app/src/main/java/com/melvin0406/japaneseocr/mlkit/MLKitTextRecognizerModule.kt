package com.melvin0406.japaneseocr.mlkit

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.japanese.JapaneseTextRecognizerOptions
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.TextRecognizer
import java.io.File

class MLKitTextRecognizerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "MLKitTextRecognizer"
    }

    @ReactMethod
    fun recognizeTextFromImage(imagePath: String, promise: Promise) {
        try {
            val imgFile = File(imagePath.replace("file://", ""))
            if (!imgFile.exists()) {
                promise.reject("IMAGE_ERROR", "Image file does not exist")
                return
            }

            val bitmap = BitmapFactory.decodeFile(imgFile.absolutePath)
            val image = InputImage.fromBitmap(bitmap, 0)

            val recognizer: TextRecognizer = TextRecognition.getClient(JapaneseTextRecognizerOptions.Builder().build())

            recognizer.process(image)
                .addOnSuccessListener { result ->
                    val fullText = StringBuilder()
                    result.textBlocks.forEach { block ->
                        fullText.append(block.text).append("\n")
                    }
                    promise.resolve(fullText.toString())
                }
                .addOnFailureListener { e ->
                    promise.reject("MLKIT_ERROR", e.message)
                }
        } catch (e: Exception) {
            promise.reject("PROCESSING_ERROR", e.message)
        }
    }
}