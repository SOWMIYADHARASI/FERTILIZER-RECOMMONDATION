import os
import pandas as pd
import numpy as np
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

def build_machine_learning_pipeline():
    print("Initializing Machine Learning Pipeline...")
    
    # Path setup
    dataset_path = os.path.join(os.path.dirname(__file__), "../dataset/fertilizer.csv")
    model_output_path = os.path.join(os.path.dirname(__file__), "model.pkl")
    scaler_output_path = os.path.join(os.path.dirname(__file__), "scaler.pkl")
    encoder_output_path = os.path.join(os.path.dirname(__file__), "encoder.pkl")
    
    # Check if dataset exists, if not generate realistic synthetic records for training fallback
    if not os.path.exists(dataset_path):
        print("Dataset not found. Generating a realistic fertilizer.csv dataset first...")
        os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
        generate_dummy_dataset(dataset_path)
        
    # 1. Load Data
    df = pd.read_csv(dataset_path)
    print(f"Dataset successfully loaded. Total records: {len(df)}")
    
    # 2. Data Cleaning & Missing Values
    # Fill any missing values with median values for numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median())
            
    # 3. Label Encoding for Categorical Target (Crops or Fertilizers)
    print("Running Label Encodings...")
    label_encoder = LabelEncoder()
    df['Crop_Encoded'] = label_encoder.fit_transform(df['Crop'])
    
    # Features (Inputs) & Target (Recommended Fertilizer)
    X = df[['Crop_Encoded', 'N', 'P', 'K', 'Temperature', 'Humidity', 'Rainfall', 'pH']]
    y = df['Fertilizer']
    
    # Encode target fertilizers
    target_encoder = LabelEncoder()
    y_encoded = target_encoder.fit_transform(y)
    
    # 4. Feature Scaling (Min-Max Scaling)
    print("Normalizing features...")
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)
    
    # 5. Train-Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)
    
    # 6. Model Training & Comparison
    models = {
        "Random Forest Classifier": RandomForestClassifier(n_estimators=100, random_state=42),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Support Vector Machine (SVM)": SVC(probability=True, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42)
    }
    
    best_model_name = ""
    best_accuracy = 0.0
    best_model_obj = None
    
    print("\n--- Training Model Comparisons ---")
    for name, model in models.items():
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        acc = accuracy_score(y_test, predictions)
        print(f"{name} Test Accuracy: {acc*100:.2f}%")
        
        if acc > best_accuracy:
            best_accuracy = acc
            best_model_name = name
            best_model_obj = model
            
    print(f"\nWinner: {best_model_name} with {best_accuracy*100:.2f}% accuracy!")
    
    # 7. Saving components for deployment
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    
    # Bundle components into a single dictionary mapping models, scalers, encoders
    bundled_model = {
        "classifier": best_model_obj,
        "scaler": scaler,
        "crop_encoder": label_encoder,
        "fertilizer_encoder": target_encoder,
        "model_name": best_model_name,
        "accuracy": best_accuracy
    }
    
    with open(model_output_path, "wb") as f:
        pickle.dump(bundled_model, f)
        
    print(f"ML Pipeline completed! Trained bundle serialized successfully to: {model_output_path}")

def generate_dummy_dataset(path):
    """Generates a high-quality realistic dataset for Random Forest training"""
    np.random.seed(42)
    crops = ["Rice", "Maize", "Cotton", "Sugarcane", "Banana", "Mango", "Groundnut", "Grapes", "Watermelon", "Pomegranate"]
    fertilizers = ["Urea", "DAP", "MOP", "NPK 19-19-19", "NPK 12-32-16", "NPK 10-26-26", "Organic Compost"]
    
    data = []
    for _ in range(500):
        crop = np.random.choice(crops)
        temp = np.random.uniform(18, 45)
        humid = np.random.uniform(40, 95)
        rain = np.random.uniform(30, 280)
        ph = np.random.uniform(4.5, 8.5)
        
        # Correlate N-P-K based on crop requirements & assign target fertilizers
        if ph < 5.0:
            N, P, K = np.random.uniform(10, 40), np.random.uniform(10, 30), np.random.uniform(10, 35)
            fertilizer = "Organic Compost"
        elif crop in ["Rice", "Maize", "Sugarcane"]:
            # Nitrogen heavy feeder
            N = np.random.uniform(15, 60)
            P = np.random.uniform(30, 70)
            K = np.random.uniform(20, 60)
            if N < 35:
                fertilizer = "Urea"
            elif P < 45:
                fertilizer = "DAP"
            else:
                fertilizer = "NPK 19-19-19"
        elif crop == "Banana":
            # Potassium heavy
            N = np.random.uniform(40, 90)
            P = np.random.uniform(20, 40)
            K = np.random.uniform(15, 55)
            fertilizer = "MOP" if K < 40 else "NPK 10-26-26"
        else:
            N = np.random.uniform(20, 80)
            P = np.random.uniform(25, 80)
            K = np.random.uniform(30, 80)
            fertilizer = "NPK 12-32-16"
            
        data.append([crop, int(N), int(P), int(K), round(temp, 1), int(humid), int(rain), round(ph, 1), fertilizer])
        
    df = pd.DataFrame(data, columns=['Crop', 'N', 'P', 'K', 'Temperature', 'Humidity', 'Rainfall', 'pH', 'Fertilizer'])
    df.to_csv(path, index=False)

if __name__ == "__main__":
    build_machine_learning_pipeline()
