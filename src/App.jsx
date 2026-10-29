

import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/students';
const PROJECT_API_URL = 'http://localhost:5000/api/projects';

const initialStudent = {
  name: '',
  email: '',
  department: '',
  skills: '',
};

const initialProject = {
  title: '',
  description: '',
  category: '',
  requiredSkills: '',
  maxMembers: 3,
  createdBy: '',
};

const sampleStudents = [
  {
    _id: 'demo1',
    name: 'Lahari',
    email: 'lahari@example.com',
    department: 'IT',
    skills: 'Python, Machine Learning',
  },
  {
    _id: 'demo2',
    name: 'Ravi',
    email: 'ravi@example.com',
    department: 'CSE',
    skills: 'React, JavaScript',
  },
  {
    _id: 'demo3',
    name: 'Priya',
    email: 'priya@example.com',
    department: 'AIML',
    skills: 'AI, Python, Data Science',
  },
];

const sampleProjects = [
  {
    id: 'sample1',
    title: 'AI Healthcare Assistant',
    category: 'Artificial Intelligence',
    skills: 'Python, Machine Learning',
    members: 2,
    description:
      'Build an AI-powered assistant to support healthcare information and analysis.',
  },
  {
    id: 'sample2',
    title: 'Smart Campus Navigator',
    category: 'Web Development',
    skills: 'React, JavaScript, CSS',
    members: 3,
    description:
      'Create a web application that helps students navigate their campus.',
  },
  {
    id: 'sample3',
    title: 'Cybersecurity Scanner',
    category: 'Cybersecurity',
    skills: 'Python, Networking',
    members: 2,
    description:
      'Develop a tool that demonstrates basic network security checks.',
  },
];

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [student, setStudent] = useState(initialStudent);
  const [registeredStudents, setRegisteredStudents] =
    useState(sampleStudents);

  const [projects, setProjects] = useState(sampleProjects);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState(initialProject);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [search, setSearch] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [savingStudent, setSavingStudent] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  // Load students and projects from MongoDB through the backend.
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const response = await axios.get(API_URL);

        if (active && Array.isArray(response.data)) {
          const savedStudents = response.data;
          const savedEmails = new Set(
            savedStudents.map((item) => item.email?.toLowerCase())
          );

          setRegisteredStudents([
            ...savedStudents,
            ...sampleStudents.filter(
              (item) => !savedEmails.has(item.email.toLowerCase())
            ),
          ]);
        }
      } catch (error) {
        console.error('Could not load students:', error.message);
      } finally {
        if (active) setLoadingStudents(false);
      }

      try {
        const response = await axios.get(PROJECT_API_URL);

        if (active && Array.isArray(response.data)) {
          const savedProjects = response.data.map((project) => ({
            ...project,
            skills: project.requiredSkills,
            members: project.maxMembers,
          }));

          const savedIds = new Set(
            savedProjects.map((project) => String(project._id))
          );

          setProjects([
            ...savedProjects,
            ...sampleProjects.filter(
              (project) => !savedIds.has(String(project._id))
            ),
          ]);
        }
      } catch (error) {
        console.error('Could not load projects:', error.message);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Update student form fields.
  const handleStudentChange = (event) => {
    const { name, value } = event.target;

    setStudent((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Register a student and save it through the backend.
  const handleRegister = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    const newStudent = {
      name: student.name.trim(),
      email: student.email.trim().toLowerCase(),
      department: student.department,
      skills: student.skills.trim(),
    };

    if (
      !newStudent.name ||
      !newStudent.email ||
      !newStudent.department ||
      !newStudent.skills
    ) {
      setMessage('Please fill in all fields.');
      setMessageType('error');
      return;
    }

    setSavingStudent(true);

    try {
      const response = await axios.post(API_URL, newStudent);
      const savedStudent = response.data.student;

      setRegisteredStudents((previous) => [
        savedStudent,
        ...previous.filter(
          (item) => item.email?.toLowerCase() !== savedStudent.email.toLowerCase()
        ),
      ]);

      setStudent(initialStudent);
      setShowRegister(false);
      setMessage('Student profile saved to MongoDB successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Student registration failed:', error.message);

      setMessage(
        error.response?.data?.message ||
          'Could not save student. Check the backend connection.'
      );
      setMessageType('error');
    } finally {
      setSavingStudent(false);
    }
  };

  // Create a project and save it through the backend.
  const handleCreateProject = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    const newProject = {
      title: projectForm.title.trim(),
      description: projectForm.description.trim(),
      category: projectForm.category,
      requiredSkills: projectForm.requiredSkills.trim(),
      maxMembers: Number(projectForm.maxMembers),
      createdBy: projectForm.createdBy.trim(),
    };

    if (
      !newProject.title ||
      !newProject.description ||
      !newProject.category ||
      !newProject.requiredSkills ||
      !newProject.createdBy ||
      !Number.isInteger(newProject.maxMembers) ||
      newProject.maxMembers < 1
    ) {
      setMessage('Please complete all project fields correctly.');
      setMessageType('error');
      return;
    }

    setSavingProject(true);

    try {
      const response = await axios.post(
        PROJECT_API_URL,
        newProject
      );

      const savedProject = {
        ...response.data.project,
        skills: response.data.project.requiredSkills,
        members: response.data.project.maxMembers,
      };

      setProjects((previous) => [
        savedProject,
        ...previous.filter(
          (item) => String(item._id) !== String(savedProject._id)
        ),
      ]);

      setProjectForm(initialProject);
      setShowProjectForm(false);
      setMessage('Project saved to MongoDB successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Project creation failed:', error.message);

      setMessage(
        error.response?.data?.message ||
          'Could not save project. Check the backend connection.'
      );
      setMessageType('error');
    } finally {
      setSavingProject(false);
    }
  };

  // Search by project title, category, or required skills.
  const filteredProjects = projects.filter((project) => {
    const query = search.toLowerCase().trim();

    return (
      project.title.toLowerCase().includes(query) ||
      project.category.toLowerCase().includes(query) ||
      (project.skills || project.requiredSkills || '')
        .toLowerCase()
        .includes(query)
    );
  });

  // Display project details.
  const handleViewProject = (project) => {
    window.alert(
      `${project.title}\n\n${project.description}\n\n` +
        `Category: ${project.category}\n` +
        `Skills: ${project.skills || project.requiredSkills}\n` +
        `Maximum team members: ${project.members || project.maxMembers}\n` +
        `Created by: ${project.createdBy || 'Demo project'}`
    );
  };

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg bg-white border-bottom px-4">
        <a className="navbar-brand fw-bold text-primary" href="#home">
          HackMate
        </a>

        <div className="ms-auto d-flex align-items-center gap-3">
          <span className="text-secondary d-none d-sm-inline">
            Build your dream team
          </span>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setShowRegister(true);
              setMessage('');
              setMessageType('');
            }}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero section */}
      <header id="home" className="hero text-center">
        <span className="badge bg-primary mb-3">
          HACKATHON TEAM FORMATION PORTAL
        </span>

        <h1>
          Great ideas need{' '}
          <span className="text-primary">great teams.</span>
        </h1>

        <p className="lead text-secondary">
          Discover projects, showcase your skills, and find your hackathon
          teammates.
        </p>

        <button
          type="button"
          className="btn btn-primary btn-lg mt-3"
          onClick={() => {
            setShowProjectForm((previous) => !previous);
            setMessage('');
            setMessageType('');
          }}
        >
          {showProjectForm ? 'Cancel' : '+ Create Project'}
        </button>

        {/* Create project form */}
        {showProjectForm && (
          <form
            onSubmit={handleCreateProject}
            className="card p-4 mt-4 mb-4 text-start"
          >
            <h2 className="h4 mb-3">Create a New Project</h2>

            <label className="form-label" htmlFor="projectTitle">
              Project Title
            </label>
            <input
              id="projectTitle"
              className="form-control mb-3"
              placeholder="Enter project title"
              value={projectForm.title}
              onChange={(event) =>
                setProjectForm({
                  ...projectForm,
                  title: event.target.value,
                })
              }
              required
            />

            <label className="form-label" htmlFor="projectDescription">
              Project Description
            </label>
            <textarea
              id="projectDescription"
              className="form-control mb-3"
              placeholder="Describe your project"
              rows="3"
              value={projectForm.description}
              onChange={(event) =>
                setProjectForm({
                  ...projectForm,
                  description: event.target.value,
                })
              }
              required
            />

            <label className="form-label" htmlFor="projectCategory">
              Category
            </label>
            <select
              id="projectCategory"
              className="form-select mb-3"
              value={projectForm.category}
              onChange={(event) =>
                setProjectForm({
                  ...projectForm,
                  category: event.target.value,
                })
              }
              required
            >
              <option value="">Select Category</option>
              <option value="Artificial Intelligence">
                Artificial Intelligence
              </option>
              <option value="Web Development">Web Development</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Data Science">Data Science</option>
              <option value="IoT">IoT</option>
            </select>

            <label className="form-label" htmlFor="requiredSkills">
              Required Skills
            </label>
            <input
              id="requiredSkills"
              className="form-control mb-3"
              placeholder="e.g. Python, React"
              value={projectForm.requiredSkills}
              onChange={(event) =>
                setProjectForm({
                  ...projectForm,
                  requiredSkills: event.target.value,
                })
              }
              required
            />

            <label className="form-label" htmlFor="maxMembers">
              Maximum Team Members
            </label>
            <input
              id="maxMembers"
              className="form-control mb-3"
              type="number"
              min="1"
              step="1"
              value={projectForm.maxMembers}
              onChange={(event) =>
                setProjectForm({
                  ...projectForm,
                  maxMembers: event.target.value,
                })
              }
              required
            />

            <label className="form-label" htmlFor="createdBy">
              Your Name
            </label>
            <input
              id="createdBy"
              className="form-control mb-3"
              placeholder="Enter project creator's name"
              value={projectForm.createdBy}
              onChange={(event) =>
                setProjectForm({
                  ...projectForm,
                  createdBy: event.target.value,
                })
              }
              required
            />

            <button
              type="submit"
              className="btn btn-success"
              disabled={savingProject}
            >
              {savingProject ? 'Saving to MongoDB...' : 'Submit Project'}
            </button>
          </form>
        )}

        <a
          href="#projects"
          className="btn btn-outline-primary btn-lg mt-3 ms-2"
        >
          Explore Projects
        </a>
      </header>

      {/* Main content */}
      <main className="container py-5">
        {/* Status message */}
        {message && (
          <div
            className={`alert ${
              messageType === 'success'
                ? 'alert-success'
                : 'alert-danger'
            }`}
            role="status"
          >
            {message}
          </div>
        )}

        {/* Student registration form */}
        {showRegister && (
          <section
            className="registration-card card shadow-sm mb-5"
            id="registration"
          >
            <div className="card-body p-4">
              <h2 className="h3 mb-4">Create Your Student Profile</h2>

              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-control"
                    value={student.name}
                    onChange={handleStudentChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-control"
                    value={student.email}
                    onChange={handleStudentChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="department" className="form-label">
                    Department
                  </label>
                  <select
                    id="department"
                    name="department"
                    className="form-select"
                    value={student.department}
                    onChange={handleStudentChange}
                    required
                  >
                    <option value="">Select your department</option>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="AIML">
                      AI and Machine Learning (AIML)
                    </option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="EEE">Electrical (EEE)</option>
                    <option value="IT">
                      Information Technology (IT)
                    </option>
                    <option value="Mechanical">
                      Mechanical Engineering
                    </option>
                    <option value="Civil">Civil Engineering</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="skills" className="form-label">
                    Skills
                  </label>
                  <input
                    id="skills"
                    name="skills"
                    type="text"
                    className="form-control"
                    placeholder="e.g. React, Python, Machine Learning"
                    value={student.skills}
                    onChange={handleStudentChange}
                    required
                  />
                  <div className="form-text">
                    Separate multiple skills with commas.
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={savingStudent}
                  >
                    {savingStudent ? 'Saving to MongoDB...' : 'Create Profile'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowRegister(false);
                      setStudent(initialStudent);
                    }}
                    disabled={savingStudent}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {/* Explore projects */}
        <section id="projects" className="mb-5">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h2 className="section-title">Explore Projects</h2>
              <p className="text-secondary mb-0">
                Find a project that matches your skills.
              </p>
            </div>

            <input
              type="search"
              className="form-control search-box"
              placeholder="Search projects or skills..."
              aria-label="Search projects or skills"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="row g-4">
            {filteredProjects.map((project) => (
              <div
                className="col-12 col-md-6 col-lg-4"
                key={project._id || project.id}
              >
                <article className="project-card card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column p-4">
                    <div className="mb-3">
                      <span className="badge bg-light text-dark">
                        {project.category}
                      </span>
                    </div>

                    <h3 className="h5 fw-bold">{project.title}</h3>

                    <p className="text-secondary">
                      Skills: {project.skills || project.requiredSkills}
                    </p>

                    <p>
                      {project._id
                        ? `${project.members || project.maxMembers} maximum team members`
                        : `${project.members} members needed`}
                    </p>

                    <button
                      type="button"
                      className="btn btn-outline-primary mt-auto"
                      onClick={() => handleViewProject(project)}
                    >
                      View Project
                    </button>
                  </div>
                </article>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="col-12">
                <p className="text-secondary">
                  No projects match your search.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Registered students */}
        <section id="students">
          <h2 className="section-title mb-4">Registered Students</h2>

          {loadingStudents ? (
            <p className="text-secondary">Loading student profiles...</p>
          ) : registeredStudents.length === 0 ? (
            <p className="text-secondary">
              No students registered yet. Create your profile to get started.
            </p>
          ) : (
            <div className="row g-3">
              {registeredStudents.map((registeredStudent) => (
                <div
                  className="col-12 col-md-6"
                  key={registeredStudent._id || registeredStudent.email}
                >
                  <article className="student-card card h-100 shadow-sm">
                    <div className="card-body">
                      <h3 className="h5 fw-bold">
                        {registeredStudent.name}
                      </h3>
                      <p className="mb-2">{registeredStudent.email}</p>
                      <p className="mb-2">
                        Department: {registeredStudent.department}
                      </p>
                      <p className="mb-0">
                        Skills: {registeredStudent.skills}
                      </p>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center text-secondary border-top py-4">
        HackMate | Connecting students, building teams.
      </footer>
    </div>
  );
}

export default App;
