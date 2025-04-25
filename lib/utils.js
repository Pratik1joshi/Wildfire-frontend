// Helper function for smooth scrolling
export function smoothScroll(targetId) {
    const targetElement = document.querySelector(targetId)
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: "smooth",
      })
    }
  }
  
  // Format date for display
  export function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }
  
  // Calculate risk level based on various factors
  export function calculateRiskLevel(temperature, humidity, windSpeed, dryVegetation) {
    let riskScore = 0
  
    // Temperature factor (higher temperature = higher risk)
    if (temperature > 35) riskScore += 30
    else if (temperature > 30) riskScore += 20
    else if (temperature > 25) riskScore += 10
  
    // Humidity factor (lower humidity = higher risk)
    if (humidity < 20) riskScore += 30
    else if (humidity < 30) riskScore += 20
    else if (humidity < 40) riskScore += 10
  
    // Wind speed factor (higher wind speed = higher risk)
    if (windSpeed > 30) riskScore += 25
    else if (windSpeed > 20) riskScore += 15
    else if (windSpeed > 10) riskScore += 5
  
    // Dry vegetation factor
    if (dryVegetation > 80) riskScore += 15
    else if (dryVegetation > 60) riskScore += 10
    else if (dryVegetation > 40) riskScore += 5
  
    // Determine risk level based on score
    if (riskScore >= 60) return "high"
    else if (riskScore >= 30) return "medium"
    else return "low"
  }
  
  