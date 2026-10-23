// Starter curriculum catalogue for the adaptive-learning MVP.
// Expand and review this catalogue with subject teachers before production use.
export const CURRICULUM = [
  { id:"g6-math-fractions", grade:6, subject:"Mathematics", title:"Fractions", language:"en", prerequisites:[], description:"Compare, simplify, and operate on fractions.", questions:[
    { id:"g6-frac-1", difficulty:1, prompt:"Which fraction is equivalent to 1/2?", options:["2/4","2/3","3/5","1/3"], answerIndex:0, explanation:"2/4 simplifies to 1/2 when numerator and denominator are divided by 2." },
    { id:"g6-frac-2", difficulty:2, prompt:"What is 1/4 + 2/4?", options:["3/8","3/4","2/4","1/2"], answerIndex:1, explanation:"The denominators are equal, so add the numerators: (1 + 2)/4 = 3/4." }
  ]},
  { id:"g6-math-integers", grade:6, subject:"Mathematics", title:"Integers", language:"en", prerequisites:[], description:"Understand positive and negative whole numbers.", questions:[
    { id:"g6-int-1", difficulty:1, prompt:"What is -3 + 5?", options:["-8","-2","2","8"], answerIndex:2, explanation:"Starting at -3 and moving 5 steps right gives 2." }
  ]},
  { id:"g7-math-rational", grade:7, subject:"Mathematics", title:"Rational Numbers", language:"en", prerequisites:["g6-math-fractions","g6-math-integers"], description:"Represent and compare rational numbers.", questions:[
    { id:"g7-rat-1", difficulty:1, prompt:"Which is greater?", options:["-1/2","-1/3","They are equal","Cannot compare"], answerIndex:1, explanation:"-1/3 is closer to zero than -1/2, so it is greater." }
  ]},
  { id:"g7-math-equations", grade:7, subject:"Mathematics", title:"Simple Equations", language:"en", prerequisites:["g6-math-integers"], description:"Solve one-step and simple linear equations.", questions:[
    { id:"g7-eq-1", difficulty:1, prompt:"If x + 4 = 9, what is x?", options:["3","4","5","13"], answerIndex:2, explanation:"Subtract 4 from both sides: x = 9 - 4 = 5." }
  ]},
  { id:"g8-math-linear", grade:8, subject:"Mathematics", title:"Linear Equations", language:"en", prerequisites:["g7-math-equations","g6-math-fractions"], description:"Solve linear equations with variables on both sides.", questions:[
    { id:"g8-lin-1", difficulty:1, prompt:"Solve 2x = 12.", options:["4","5","6","10"], answerIndex:2, explanation:"Divide both sides by 2 to get x = 6." },
    { id:"g8-lin-2", difficulty:2, prompt:"Solve 3x + 2 = 14.", options:["2","4","6","8"], answerIndex:1, explanation:"Subtract 2 to get 3x = 12, then divide by 3: x = 4." }
  ]},
  { id:"g8-science-force", grade:8, subject:"Science", title:"Force and Pressure", language:"en", prerequisites:[], description:"Explore force, pressure, and everyday examples.", questions:[
    { id:"g8-force-1", difficulty:1, prompt:"Pressure is calculated as:", options:["Force × Area","Force ÷ Area","Area ÷ Force","Mass × Speed"], answerIndex:1, explanation:"Pressure is force acting per unit area." }
  ]},
  { id:"g9-math-polynomials", grade:9, subject:"Mathematics", title:"Polynomials", language:"en", prerequisites:["g8-math-linear"], description:"Identify terms, coefficients, and polynomial degree.", questions:[
    { id:"g9-poly-1", difficulty:1, prompt:"What is the degree of 4x² + 3x + 1?", options:["1","2","3","4"], answerIndex:1, explanation:"The highest exponent of x is 2, so the polynomial has degree 2." }
  ]},
  { id:"g9-science-motion", grade:9, subject:"Science", title:"Motion", language:"en", prerequisites:[], description:"Understand distance, displacement, speed, and velocity.", questions:[
    { id:"g9-motion-1", difficulty:1, prompt:"Speed is:", options:["Distance ÷ Time","Time ÷ Distance","Mass × Acceleration","Force ÷ Area"], answerIndex:0, explanation:"Average speed equals total distance travelled divided by total time." }
  ]},
  { id:"g10-math-quadratic", grade:10, subject:"Mathematics", title:"Quadratic Equations", language:"en", prerequisites:["g9-math-polynomials","g8-math-linear"], description:"Recognize and solve quadratic equations.", questions:[
    { id:"g10-quad-1", difficulty:1, prompt:"Which is a quadratic equation?", options:["2x + 1 = 0","x² - 5x + 6 = 0","x³ = 8","1/x = 2"], answerIndex:1, explanation:"A quadratic equation has highest variable power 2." }
  ]},
  { id:"g10-science-electricity", grade:10, subject:"Science", title:"Electricity", language:"en", prerequisites:[], description:"Learn current, voltage, resistance, and Ohm's law.", questions:[
    { id:"g10-elec-1", difficulty:1, prompt:"Ohm's law is:", options:["V = IR","P = mgh","F = ma","v = u + at"], answerIndex:0, explanation:"Ohm's law relates voltage, current, and resistance: V = I × R." }
  ]},
  { id:"py-basics", grade:10, subject:"Programming", title:"Python Basics (Extension)", language:"en", prerequisites:[], description:"Optional enrichment track for students exploring programming.", questions:[
    { id:"py-1", difficulty:1, prompt:"Which Python keyword defines a function?", options:["func","define","def","function"], answerIndex:2, explanation:"Python uses the def keyword to define a function." }
  ]}
];

export const getTopic = (topicId) => CURRICULUM.find((topic) => topic.id === topicId);
export const getQuestion = (topicId, questionId) => getTopic(topicId)?.questions.find((question) => question.id === questionId);
