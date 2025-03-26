from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from sklearn.cluster import DBSCAN
from datetime import datetime
import math

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BusPoint(BaseModel):
    bus_id: str
    speed: float
    people_count: int
    latitude: float
    longitude: float
    timestamp: str

class ClusteringRequest(BaseModel):
    bus_points: List[BusPoint]

class ClusteringResponse(BaseModel):
    clusters: List[List[str]]  # List of bus IDs in each cluster
    cluster_analyses: List[dict]
    overall_risk_level: str
    recommendations: List[str]

def calculate_distance(lat1, lon1, lat2, lon2):
    # Haversine formula for calculating distance between two points on Earth
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    distance = R * c
    
    return distance

def analyze_cluster(cluster_buses, all_buses):
    # Calculate cluster statistics
    speeds = [b.speed for b in cluster_buses]
    people_counts = [b.people_count for b in cluster_buses]
    
    avg_speed = np.mean(speeds)
    avg_people = np.mean(people_counts)
    cluster_size = len(cluster_buses)
    
    # Define risk assessment rules
    risk_level = "LOW"
    analysis = []
    
    # Speed-based analysis
    if avg_speed < 20:
        analysis.append("Low speed indicates possible traffic or stops")
        risk_level = "MEDIUM"
    elif avg_speed > 60:
        analysis.append("High speed with multiple buses indicates potential safety risk")
        risk_level = "HIGH"
    
    # Passenger count analysis
    if avg_people > 50:
        analysis.append("High passenger count detected")
        risk_level = "HIGH" if risk_level == "MEDIUM" else "MEDIUM"
    
    # Cluster size analysis
    if cluster_size >= 3:
        analysis.append(f"Large cluster of {cluster_size} buses detected")
        risk_level = "HIGH" if risk_level == "MEDIUM" else "MEDIUM"
    
    # Generate recommendations based on risk level
    recommendations = []
    if risk_level == "HIGH":
        recommendations = [
            "Consider alternative routes",
            "Wait for next bus",
            "Check real-time updates"
        ]
    elif risk_level == "MEDIUM":
        recommendations = [
            "Monitor bus status",
            "Consider alternative timing",
            "Check for delays"
        ]
    else:
        recommendations = [
            "Normal service",
            "Regular monitoring recommended"
        ]
    
    return {
        "risk_level": risk_level,
        "analysis": " | ".join(analysis) if analysis else "Normal conditions",
        "recommendations": recommendations,
        "statistics": {
            "average_speed": round(avg_speed, 2),
            "average_passengers": round(avg_people, 2),
            "cluster_size": cluster_size
        }
    }

@app.get("/")
async def root():
    return {"message": "Bus Clustering Detection API"}

@app.post("/detect-clusters")
async def detect_clusters(request: ClusteringRequest):
    try:
        if not request.bus_points:
            raise HTTPException(status_code=400, detail="No bus points provided")
        
        # Prepare data for clustering
        X = np.array([[point.latitude, point.longitude] for point in request.bus_points])
        
        # Perform DBSCAN clustering
        # eps: maximum distance between samples (in degrees)
        # min_samples: minimum number of samples in a neighborhood
        clustering = DBSCAN(eps=0.01, min_samples=2).fit(X)
        
        # Get cluster labels
        labels = clustering.labels_
        
        # Group bus IDs by cluster
        clusters = []
        cluster_analyses = []
        
        for label in set(labels):
            if label != -1:  # -1 represents noise points
                cluster_buses = [
                    request.bus_points[i] 
                    for i in range(len(labels)) 
                    if labels[i] == label
                ]
                cluster_ids = [bus.bus_id for bus in cluster_buses]
                clusters.append(cluster_ids)
                
                # Analyze the cluster
                analysis = analyze_cluster(cluster_buses, request.bus_points)
                cluster_analyses.append(analysis)
        
        # Determine overall risk level
        risk_levels = [a["risk_level"] for a in cluster_analyses]
        overall_risk = "HIGH" if "HIGH" in risk_levels else "MEDIUM" if "MEDIUM" in risk_levels else "LOW"
        
        # Combine all recommendations
        all_recommendations = []
        for analysis in cluster_analyses:
            all_recommendations.extend(analysis["recommendations"])
        unique_recommendations = list(set(all_recommendations))  # Remove duplicates
        
        return {
            "clusters": clusters,
            "cluster_analyses": cluster_analyses,
            "overall_risk_level": overall_risk,
            "recommendations": unique_recommendations
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 