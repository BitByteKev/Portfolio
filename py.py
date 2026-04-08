def kevin():
    name = "Kevin"
    age = 23
    hobbies = ["coding", "working", "reading"]
    return f"{name} is {age} years old and enjoys {', '.join(hobbies)}. He is currently learning Python and web development."

def medical():
    weight = 190  # in pounds
    height_ft = 5
    height_in = 11
    # Convert height to inches
    total_height_in = height_ft * 12 + height_in
    # Convert height to meters
    height_m = total_height_in * 0.0254
    # Convert weight to kg
    weight_kg = weight * 0.453592
    bmi = round(weight_kg / (height_m ** 2), 2)
    if bmi < 18.5:
        category = 'underweight'
    elif bmi < 24.9:
        category = 'normal weight'
    elif bmi < 29.9:
        category = 'overweight'
    else:
        category = 'obese'
    return f"Your BMI is {bmi}. You are {category}."

if __name__ == "__main__":
    print(kevin())
    print(medical())