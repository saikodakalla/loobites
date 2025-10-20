from fastapi import FastAPI, File, UploadFile
from transformers import ViTFeatureExtractor, ViTForImageClassification
from PIL import Image
import torch
import io


app = FastAPI()

# this is the pretrained model for food classfication
model_name = "google/vit-base-patch16-224-in21k"
model = ViTForImageClassification.from_pretrained(model_name)
feature_extractor = ViTFeatureExtractor.from_pretrained(model_name)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read image
    image = Image.open(io.BytesIO(await file.read()))

    # Preprocess image
    inputs = feature_extractor(images=image, return_tensors="pt")

    # Forward pass
    with torch.no_grad():
        logits = model(**inputs).logits

    # Get predicted label
    predicted_class_idx = logits.argmax(-1).item()
    predicted_label = model.config.id2label[predicted_class_idx]

    return {"label": predicted_label}

'''@app.route("/predict", methods=["POST"])
def predict():
    file = request.files["file"]
    image = Image.open(file.stream)

    #converts the image to a Pytorch tensor suitable for the model
    inputs = processor(images=image, return_tensors="pt")
    #runs the image through the neural network to get predictions
    outputs = model(**inputs)

    #finds the class with the highest score 
    #.item converts from tensor to regular python integer
    predicted_class_id = outputs.logits.argmax(-1).item()
    #dictionary mapping class index -> class name
    label = model.config.id2label[predicted_class_id]
    #label is bascially a str now


    #converts python dict to JSON
    return jsonify({"label":label})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
'''