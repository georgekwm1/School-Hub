# School Hub

School Hub is a user-friendly platform that facilitates communication between teachers and students, enabling them to easily share resources, ask questions, and receive feedback. The platform offers students access to various learning materials, allowing them to review and gain a deeper understanding of lessons. By creating an interactive learning environment, School Hub enhances the connection between students and teachers beyond the classroom.

## Features

- **Teacher-Student Communication**: Students can ask questions and get answers directly from their teachers.
- **Resource Sharing**: Teachers can upload resources for students to access at any time.
- **Feedback System**: Teachers can provide feedback on students' questions and progress.
- **Accessible Learning Materials**: Students can access shared resources to aid in their learning.

## Tech Stack

- **Frontend**: React
- **Backend**: Django
- **Database**: PostgreSQL
- **Authentication**: OpenCV, TensorFlow (facial recognition)

## Endpoints

You can access the API [here](https://georgekwm1.pythonanywhere.com/api) for a list of endpoints.

## Getting Started

Follow these steps to clone and run the project locally.

### Prerequisites

- Node.js and npm (for React)
- Python 3.8+ (for Django)
- PostgreSQL (for database setup)

### Installation

#### Clone the repository

```bash
git clone https://github.com/georgekwm1/School-Hub.git
cd school-hub
```

### Backend Setup (Django)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Set up a virtual environment**:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows, use `env\Scripts\activate`
   ```

3. **Install the dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure the PostgreSQL database** in `settings.py`:
   - Update the database settings with your credentials.

5. **Run the migrations**:
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser** to access the Django admin:
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

   The backend should now be running at `http://127.0.0.1:8000`.

### Frontend Setup (React)

1. **Navigate to the frontend directory**:
   ```bash
   cd ../frontend
   ```

2. **Install the dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

   The frontend should now be running at `http://localhost:3000`.

### Project Structure

```plaintext
school-hub/
│                        # Django backend files
|
│── manage.py
│── settings.py
│
└── front-end/             # React frontend folder
    ├── src/
    ├── public/
    └── ...
```

## Collaborators

- [Oluwatimilehin Erinle](https://github.com/timmySpark) - Backend-Developer
- [Ogbonna George](https://github.com/georgekwm1) - Team-Lead (Backend-Developer)
- [Hamisu Yusuf](https://github.com/hamisuyusu) - Backend-Developer
- [Loay Al-Said](https://github.com/loayalsaid1) - Front-end-Developer

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch-name`.
3. Make your changes and commit them: `git commit -m 'Feature description'`.
4. Push to the branch: `git push origin feature-branch-name`.
5. Submit a pull request.
