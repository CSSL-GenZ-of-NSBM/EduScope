// Degree seed data for testing
const degreeTestData = [
  {
    degreeName: "BSc (Hons) in Computer Science",
    faculty: "Faculty of Computing",
    affiliatedUniversity: "NSBM Green University",
    duration: 4,
    price: 750000,
    description: "A comprehensive program covering software development, algorithms, data structures, and modern computing technologies.",
    admissionRequirements: [
      "3 passes at GCE A/L including Mathematics",
      "Credit pass in English at GCE O/L",
      "Credit pass in Mathematics at GCE O/L"
    ],
    careerPaths: [
      "Software Engineer",
      "Full Stack Developer",
      "Data Scientist",
      "Software Architect",
      "Systems Analyst"
    ],
    modules: [
      {
        year: 1,
        semester: 1,
        moduleName: "Programming Fundamentals",
        moduleCode: "CS101",
        credits: 4,
        description: "Introduction to programming concepts using Python"
      },
      {
        year: 1,
        semester: 1,
        moduleName: "Mathematics for Computing",
        moduleCode: "MA101",
        credits: 3,
        description: "Essential mathematical concepts for computer science"
      },
      {
        year: 1,
        semester: 1,
        moduleName: "Computer Systems",
        moduleCode: "CS102",
        credits: 3,
        description: "Introduction to computer hardware and operating systems"
      },
      {
        year: 1,
        semester: 2,
        moduleName: "Object-Oriented Programming",
        moduleCode: "CS201",
        credits: 4,
        description: "Advanced programming using Java and OOP principles"
      },
      {
        year: 1,
        semester: 2,
        moduleName: "Data Structures",
        moduleCode: "CS202",
        credits: 4,
        description: "Linear and non-linear data structures"
      },
      {
        year: 2,
        semester: 1,
        moduleName: "Database Systems",
        moduleCode: "CS301",
        credits: 4,
        description: "Database design, SQL, and database management"
      },
      {
        year: 2,
        semester: 1,
        moduleName: "Web Development",
        moduleCode: "CS302",
        credits: 3,
        description: "Frontend and backend web development"
      },
      {
        year: 2,
        semester: 2,
        moduleName: "Software Engineering",
        moduleCode: "CS401",
        credits: 4,
        description: "Software development methodologies and project management"
      }
    ],
    isActive: true
  },
  {
    degreeName: "BSc (Hons) in Software Engineering",
    faculty: "Faculty of Computing",
    affiliatedUniversity: "Plymouth University",
    duration: 4,
    price: 800000,
    description: "Specialized program focusing on large-scale software development and engineering practices.",
    admissionRequirements: [
      "3 passes at GCE A/L including Mathematics",
      "Credit pass in English at GCE O/L",
      "Credit pass in ICT at GCE O/L (preferred)"
    ],
    careerPaths: [
      "Software Engineer",
      "DevOps Engineer",
      "Technical Lead",
      "Software Architect",
      "Project Manager"
    ],
    modules: [
      {
        year: 1,
        semester: 1,
        moduleName: "Introduction to Software Engineering",
        moduleCode: "SE101",
        credits: 4,
        description: "Fundamentals of software engineering principles"
      },
      {
        year: 1,
        semester: 1,
        moduleName: "Programming in Java",
        moduleCode: "SE102",
        credits: 4,
        description: "Java programming and enterprise development"
      },
      {
        year: 1,
        semester: 2,
        moduleName: "Software Design Patterns",
        moduleCode: "SE201",
        credits: 3,
        description: "Common design patterns in software development"
      },
      {
        year: 2,
        semester: 1,
        moduleName: "Agile Development",
        moduleCode: "SE301",
        credits: 3,
        description: "Agile methodologies and practices"
      }
    ],
    isActive: true
  },
  {
    degreeName: "BBA in Business Administration",
    faculty: "Faculty of Business",
    affiliatedUniversity: "NSBM Green University",
    duration: 4,
    price: 650000,
    description: "Comprehensive business program covering management, finance, marketing, and entrepreneurship.",
    admissionRequirements: [
      "3 passes at GCE A/L",
      "Credit pass in English at GCE O/L",
      "Credit pass in Mathematics at GCE O/L"
    ],
    careerPaths: [
      "Business Analyst",
      "Marketing Manager",
      "Project Manager",
      "Business Consultant",
      "Entrepreneur"
    ],
    modules: [
      {
        year: 1,
        semester: 1,
        moduleName: "Introduction to Business",
        moduleCode: "BBA101",
        credits: 3,
        description: "Fundamentals of business and management"
      },
      {
        year: 1,
        semester: 1,
        moduleName: "Business Mathematics",
        moduleCode: "BBA102",
        credits: 3,
        description: "Mathematical concepts for business applications"
      },
      {
        year: 1,
        semester: 2,
        moduleName: "Marketing Principles",
        moduleCode: "BBA201",
        credits: 3,
        description: "Core concepts of marketing and consumer behavior"
      },
      {
        year: 2,
        semester: 1,
        moduleName: "Financial Management",
        moduleCode: "BBA301",
        credits: 4,
        description: "Corporate finance and investment decisions"
      }
    ],
    isActive: true
  },
  {
    degreeName: "BEng (Hons) in Civil Engineering",
    faculty: "Faculty of Engineering",
    affiliatedUniversity: "Victoria University",
    duration: 4,
    price: 900000,
    description: "Professional engineering program covering structural, environmental, and transportation engineering.",
    admissionRequirements: [
      "3 passes at GCE A/L including Mathematics and Physics",
      "Credit pass in English at GCE O/L",
      "Credit pass in Mathematics at GCE O/L"
    ],
    careerPaths: [
      "Civil Engineer",
      "Structural Engineer",
      "Project Manager",
      "Construction Manager",
      "Engineering Consultant"
    ],
    modules: [
      {
        year: 1,
        semester: 1,
        moduleName: "Engineering Mathematics I",
        moduleCode: "CE101",
        credits: 4,
        description: "Advanced mathematics for engineering applications"
      },
      {
        year: 1,
        semester: 1,
        moduleName: "Engineering Drawing",
        moduleCode: "CE102",
        credits: 3,
        description: "Technical drawing and CAD fundamentals"
      },
      {
        year: 1,
        semester: 2,
        moduleName: "Mechanics of Materials",
        moduleCode: "CE201",
        credits: 4,
        description: "Stress, strain, and material properties"
      },
      {
        year: 2,
        semester: 1,
        moduleName: "Structural Analysis",
        moduleCode: "CE301",
        credits: 4,
        description: "Analysis of structural systems and loads"
      }
    ],
    isActive: true
  },
  {
    degreeName: "BSc (Hons) in Applied Sciences",
    faculty: "Faculty of Sciences",
    affiliatedUniversity: "American University",
    duration: 3,
    price: 550000,
    description: "Interdisciplinary program combining biology, chemistry, and physics for practical applications.",
    admissionRequirements: [
      "3 passes at GCE A/L including 2 science subjects",
      "Credit pass in English at GCE O/L",
      "Credit pass in Mathematics at GCE O/L"
    ],
    careerPaths: [
      "Research Scientist",
      "Laboratory Technician",
      "Quality Control Analyst",
      "Environmental Scientist",
      "Science Teacher"
    ],
    modules: [
      {
        year: 1,
        semester: 1,
        moduleName: "General Chemistry",
        moduleCode: "AS101",
        credits: 4,
        description: "Fundamental principles of chemistry"
      },
      {
        year: 1,
        semester: 1,
        moduleName: "Biology Fundamentals",
        moduleCode: "AS102",
        credits: 4,
        description: "Basic concepts in biology and life sciences"
      },
      {
        year: 1,
        semester: 2,
        moduleName: "Physics for Sciences",
        moduleCode: "AS201",
        credits: 3,
        description: "Physics principles for scientific applications"
      },
      {
        year: 2,
        semester: 1,
        moduleName: "Research Methods",
        moduleCode: "AS301",
        credits: 3,
        description: "Scientific research methodology and statistics"
      }
    ],
    isActive: true
  }
]

module.exports = degreeTestData
