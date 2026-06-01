"""
Model Handler - Loads and manages the Leaf Disease Detection ML model
"""
import numpy as np
import tensorflow as tf
from pathlib import Path
import os

# Exact 38 classes from Leaf Disease Detection.ipynb
# Structure: index -> (Plant, Disease Name, Is Healthy)
CLASS_MAPPING = {
    0: ('Apple', 'Apple Scab', False),
    1: ('Apple', 'Black Rot', False),
    2: ('Apple', 'Cedar Apple Rust', False),
    3: ('Apple', 'Healthy', True),
    4: ('Blueberry', 'Healthy', True),
    5: ('Cherry', 'Powdery Mildew', False),
    6: ('Cherry', 'Healthy', True),
    7: ('Corn', 'Cercospora Leaf Spot (Gray Leaf Spot)', False),
    8: ('Corn', 'Common Rust', False),
    9: ('Corn', 'Northern Leaf Blight', False),
    10: ('Corn', 'Healthy', True),
    11: ('Grape', 'Black Rot', False),
    12: ('Grape', 'Esca (Black Measles)', False),
    13: ('Grape', 'Leaf Blight (Isariopsis Leaf Spot)', False),
    14: ('Grape', 'Healthy', True),
    15: ('Orange', 'Huanglongbing (Citrus Greening)', False),
    16: ('Peach', 'Bacterial Spot', False),
    17: ('Peach', 'Healthy', True),
    18: ('Pepper (Bell)', 'Bacterial Spot', False),
    19: ('Pepper (Bell)', 'Healthy', True),
    20: ('Potato', 'Early Blight', False),
    21: ('Potato', 'Late Blight', False),
    22: ('Potato', 'Healthy', True),
    23: ('Raspberry', 'Healthy', True),
    24: ('Soybean', 'Healthy', True),
    25: ('Squash', 'Powdery Mildew', False),
    26: ('Strawberry', 'Leaf Scorch', False),
    27: ('Strawberry', 'Healthy', True),
    28: ('Tomato', 'Bacterial Spot', False),
    29: ('Tomato', 'Early Blight', False),
    30: ('Tomato', 'Late Blight', False),
    31: ('Tomato', 'Leaf Mold', False),
    32: ('Tomato', 'Septoria Leaf Spot', False),
    33: ('Tomato', 'Spider Mites (Two-Spotted Spider Mite)', False),
    34: ('Tomato', 'Target Spot', False),
    35: ('Tomato', 'Tomato Yellow Leaf Curl Virus', False),
    36: ('Tomato', 'Tomato Mosaic Virus', False),
    37: ('Tomato', 'Healthy', True)
}

def get_disease_details(plant: str, disease: str, is_healthy: bool) -> dict:
    """Get rich descriptions, causes, and remedy suggestions dynamically"""
    if is_healthy:
        return {
            "description": f"This {plant} leaf is in excellent condition! It displays vibrant green pigmentation, strong cell walls, and contains no visible traces of fungal spores, bacterial spots, or viral symptoms.",
            "causes": "Optimal environmental temperature, appropriate irrigation schedules, well-ventilated crop layout, and healthy organic soil nutrients.",
            "remedies": [
                "Keep up the great work! Maintain the current watering schedule, watering the roots rather than the foliage.",
                "Inspect the underside of leaves weekly to detect and prevent potential pest infestations early.",
                "Apply organic compost or balanced bio-fertilizers seasonally to maintain optimal soil vitality."
            ]
        }
    
    # Fungal Scab
    if "scab" in disease.lower():
        return {
            "description": f"Scab is a destructive fungal infection caused by Venturia inaequalis. It creates dark, olive-green to black velvety spots on the leaves, leading to yellowing, cell death, and premature leaf drop.",
            "causes": "High humidity, overhead water splash, warm day temperatures with cool damp nights, and infected foliage debris left on the ground.",
            "remedies": [
                "Prune the lower branches of the {plant} to increase air flow and allow leaves to dry quickly.",
                "Rake and safely discard all fallen leaf debris to break the fungal wintering cycle.",
                "Apply a preventative organic copper-based fungicide or Neem oil solution early in the morning."
            ]
        }
    
    # Fungal Rot
    elif "rot" in disease.lower():
        return {
            "description": f"Black Rot is a severe fungal disease that leaves dark circular spots which expand rapidly into dry, black, concentric rings. It can quickly destroy the leaves and spread to the stems.",
            "causes": "Warm, humid weather combined with rain-splash, which carries fungal spores from the soil onto the foliage.",
            "remedies": [
                "Immediately prune off and burn infected leaves using sterilized shears.",
                "Avoid overhead irrigation; water at the base of the plant using drip hoses.",
                "Treat the crop with a broad-spectrum bio-fungicide containing Bacillus subtilis."
            ]
        }
    
    # Rust
    elif "rust" in disease.lower():
        return {
            "description": f"Rust is a parasitic fungal disease characterized by bright orange, powdery pustules on the lower leaf surface, with matching yellow spots on the upper surface.",
            "causes": "Prolonged leaf moisture (wet leaves for 4+ hours) under moderate temperatures, allowing fungal spores to germinate.",
            "remedies": [
                "Carefully pluck infected leaves and seal them in plastic bags before discarding them.",
                "Space plants out generously to reduce relative humidity within the canopy.",
                "Dust with organic sulfur or spray with copper fungicide at the first sign of orange spots."
            ]
        }
    
    # Powdery Mildew
    elif "mildew" in disease.lower():
        return {
            "description": f"Powdery Mildew is a widely occurring fungal disease that presents as a white, powdery coating of mycelium and spores on the surface of the leaves, restricting photosynthesis.",
            "causes": "Dry foliage combined with high relative humidity and low light levels, typically in overcrowded plant beds.",
            "remedies": [
                "Mix 1 tablespoon of baking soda with 1 teaspoon of liquid soap in a gallon of water and spray weekly.",
                "Move the plant (if potted) to a location with direct sunlight and dry, warm air.",
                "Prune dense foliage to let sunlight dry out internal leaves."
            ]
        }
    
    # Blight (Early/Late)
    elif "blight" in disease.lower():
        is_late = "late" in disease.lower()
        blight_type = "Late Blight (Phytophthora infestans)" if is_late else "Early Blight (Alternaria solani)"
        return {
            "description": f"{blight_type} is a highly infectious plant disease. It starts as small, water-soaked dark spots that enlarge into papery brown patches, often with a yellow halo, causing rapid leaf death.",
            "causes": "Warm, wet conditions for Early Blight; cool, extremely wet/cloudy weather for Late Blight. Spores spread quickly via wind and rain.",
            "remedies": [
                "Remove all infected foliage immediately. For late blight, remove the entire plant if infection is severe.",
                "Apply organic copper fungicide every 7-10 days during rainy seasons.",
                "Mulch the soil around the base of the {plant} to prevent soil spores from splashing up during rain."
            ]
        }
    
    # Bacterial Spot
    elif "spot" in disease.lower():
        return {
            "description": f"Bacterial Spot is caused by pathogens that enter leaf stomata, leaving small, dark-brown water-soaked spots with a pronounced yellow halo. The leaf will eventually turn yellow and drop.",
            "causes": "Warm, wet weather. Bacteria are introduced via splashing water, contaminated tools, or infected seeds.",
            "remedies": [
                "Never work in the garden when the plants are wet to avoid spreading bacteria.",
                "Sterilize garden shears with 70% isopropyl alcohol between every single cut.",
                "Apply a copper-octanoate spray to reduce bacterial spread on healthy tissues."
            ]
        }
    
    # Viruses (Mosaic, Yellow Curl)
    elif "virus" in disease.lower() or "mosaic" in disease.lower():
        return {
            "description": f"Viral infections disrupt the leaf's chlorophyll production, leading to mottled light-green mosaic patterns, severe leaf curling, stunting, and deformed growth.",
            "causes": "Viruses are transmitted by sap-sucking pests (such as whiteflies and aphids) or by touching plants after handling tobacco.",
            "remedies": [
                "There is no chemical cure for viral plant infections. Infected plants must be completely dug up and destroyed.",
                "Control vector insects (aphids/whiteflies) using insecticidal soaps, Neem oil, or reflective mulch.",
                "Grow virus-resistant cultivars in the future and wash hands thoroughly before gardening."
            ]
        }
    
    # Spider Mites
    elif "mite" in disease.lower():
        return {
            "description": f"Two-Spotted Spider Mites are tiny arachnids that suck cell sap from the leaves, causing fine stippling (yellow speckles), bronzing of leaves, and delicate silk webbing on the undersides.",
            "causes": "Hot, dry, and dusty conditions where natural predatory insects are absent.",
            "remedies": [
                "Spray the undersides of the leaves with a strong stream of cold water to wash away the mites.",
                "Apply organic insecticidal soap or horticultural Neem oil to suffocate active colonies.",
                "Introduce natural predators like ladybugs or predatory mites."
            ]
        }
    
    # Default catch-all for other diseases
    else:
        return {
            "description": f"Leaf disease detected on {plant}: {disease}. This condition causes structural cell damage, impacting photosynthesis and crop yield if left untreated.",
            "causes": "Environmental stress, pathogen presence, poor drainage, or physical insect damage.",
            "remedies": [
                "Carefully inspect the entire plant for pests, molds, or damp roots.",
                "Apply a general-purpose copper-based bio-fungicide or Neem oil to protect healthy leaves.",
                "Consult local agricultural extension services if symptoms worsen."
            ]
        }


class ModelHandler:
    def __init__(self, model_path: str = None):
        """
        Initialize the model handler and load the model
        
        Args:
            model_path: Path to the best_model.h5 file
        """
        if model_path is None:
            # Try to find the model in the workspace root
            model_path = "../best_model.h5"
            if not os.path.exists(model_path):
                model_path = "best_model.h5"
        
        self.model_path = model_path
        self.model = None
        self.load_model()
    
    def load_model(self):
        """Load the TensorFlow/Keras model"""
        try:
            # Prevent TensorFlow from logging excessive debug messages
            os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
            self.model = tf.keras.models.load_model(self.model_path)
            print(f"[OK] Model loaded successfully from {self.model_path}")
            print(f"  Model shape: {self.model.input_shape}")
            return True
        except Exception as e:
            print(f"[ERROR] Error loading model: {str(e)}")
            return False
    
    def predict(self, image_bytes: bytes) -> dict:
        """
        Make a prediction using the leaf image bytes
        
        Args:
            image_bytes: Raw image file bytes
            
        Returns:
            Dictionary with predictions, diagnosis, and remedy suggestions
        """
        if self.model is None:
            return {
                "success": False,
                "error": "Model not loaded",
                "predictions": None
            }
            
        try:
            import io
            from PIL import Image
            from tensorflow.keras.applications.vgg19 import preprocess_input
            
            # Load and convert image to RGB
            image = Image.open(io.BytesIO(image_bytes))
            image = image.convert("RGB")
            
            # Resize image to 256x256
            image = image.resize((256, 256))
            
            # Convert to numpy array
            img_array = np.array(image, dtype=np.float32)
            
            # Preprocess image for VGG19
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)
            
            # Make prediction
            predictions = self.model.predict(img_array, verbose=0)[0]
            
            # Get top 3 predictions
            top_indices = np.argsort(predictions)[::-1][:3]
            
            predictions_list = []
            for idx in top_indices:
                prob = float(predictions[idx])
                plant, disease, is_healthy = CLASS_MAPPING.get(idx, ("Unknown", "Unknown Disease", False))
                
                # Format a nice class label
                if is_healthy:
                    label = f"{plant} (Healthy)"
                else:
                    label = f"{plant} - {disease}"
                    
                predictions_list.append({
                    "class_id": int(idx),
                    "label": label,
                    "confidence": float(prob)
                })
            
            # Get primary diagnosis
            primary_idx = int(top_indices[0])
            plant, disease, is_healthy = CLASS_MAPPING.get(primary_idx, ("Unknown", "Unknown Disease", False))
            
            # Get remedies
            details = get_disease_details(plant, disease, is_healthy)
            
            result = {
                "success": True,
                "predictions": predictions_list,
                "diagnosis": {
                    "plant": plant,
                    "disease": disease,
                    "is_healthy": is_healthy,
                    "description": details["description"],
                    "causes": details["causes"],
                    "remedies": details["remedies"]
                }
            }
            
            return result
        except Exception as e:
            return {
                "success": False,
                "error": f"Image processing error: {str(e)}",
                "predictions": None
            }
    
    def get_model_info(self) -> dict:
        """Get information about the model"""
        if self.model is None:
            return {"error": "Model not loaded"}
        
        return {
            "input_shape": self.model.input_shape,
            "output_shape": self.model.output_shape,
            "num_layers": len(self.model.layers),
            "trainable_params": int(self.model.count_params()),
            "model_summary": "" # Omit verbose console printing to save bandwidth
        }

# Initialize model handler
model_handler = None

def initialize_model(model_path: str = None):
    """Initialize the global model handler"""
    global model_handler
    model_handler = ModelHandler(model_path)
    return model_handler

def get_model_handler() -> ModelHandler:
    """Get the global model handler instance"""
    global model_handler
    if model_handler is None:
        model_handler = ModelHandler()
    return model_handler
