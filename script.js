// Gym Tracker Application
class GymTracker {
    constructor() {
        this.currentWorkout = null;
        this.workoutStartTime = null;
        this.timerInterval = null;
        this.exercises = [];
        this.workoutHistory = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.initializeDefaultExercises();
        this.setupEventListeners();
        this.updateDashboard();
        this.renderExercises();
        this.renderHistory();
    }

    // Default exercise library
    initializeDefaultExercises() {
        const defaultExercises = [
            // Chest
            { id: 'bench-press', name: 'Bench Press', category: 'chest', type: 'weight' },
            { id: 'incline-bench', name: 'Incline Bench Press', category: 'chest', type: 'weight' },
            { id: 'pushups', name: 'Push-ups', category: 'chest', type: 'weight' },
            { id: 'dumbbell-flyes', name: 'Dumbbell Flyes', category: 'chest', type: 'weight' },
            
            // Back
            { id: 'deadlift', name: 'Deadlift', category: 'back', type: 'weight' },
            { id: 'pullups', name: 'Pull-ups', category: 'back', type: 'weight' },
            { id: 'bent-over-row', name: 'Bent Over Row', category: 'back', type: 'weight' },
            { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'back', type: 'weight' },
            
            // Shoulders
            { id: 'overhead-press', name: 'Overhead Press', category: 'shoulders', type: 'weight' },
            { id: 'lateral-raises', name: 'Lateral Raises', category: 'shoulders', type: 'weight' },
            { id: 'rear-delt-flyes', name: 'Rear Delt Flyes', category: 'shoulders', type: 'weight' },
            
            // Arms
            { id: 'bicep-curls', name: 'Bicep Curls', category: 'arms', type: 'weight' },
            { id: 'tricep-dips', name: 'Tricep Dips', category: 'arms', type: 'weight' },
            { id: 'hammer-curls', name: 'Hammer Curls', category: 'arms', type: 'weight' },
            { id: 'tricep-extensions', name: 'Tricep Extensions', category: 'arms', type: 'weight' },
            
            // Legs
            { id: 'squats', name: 'Squats', category: 'legs', type: 'weight' },
            { id: 'lunges', name: 'Lunges', category: 'legs', type: 'weight' },
            { id: 'leg-press', name: 'Leg Press', category: 'legs', type: 'weight' },
            { id: 'calf-raises', name: 'Calf Raises', category: 'legs', type: 'weight' },
            
            // Core
            { id: 'plank', name: 'Plank', category: 'core', type: 'time' },
            { id: 'crunches', name: 'Crunches', category: 'core', type: 'weight' },
            { id: 'russian-twists', name: 'Russian Twists', category: 'core', type: 'weight' },
            
            // Cardio
            { id: 'running', name: 'Running', category: 'cardio', type: 'distance' },
            { id: 'cycling', name: 'Cycling', category: 'cardio', type: 'distance' },
            { id: 'jumping-jacks', name: 'Jumping Jacks', category: 'cardio', type: 'time' }
        ];

        if (this.exercises.length === 0) {
            this.exercises = defaultExercises;
            this.saveData();
        }
    }

    // Event listeners setup
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Workout controls
        document.getElementById('start-workout').addEventListener('click', () => {
            this.startWorkout();
        });

        document.getElementById('end-workout').addEventListener('click', () => {
            this.endWorkout();
        });

        // Add exercise to workout
        document.getElementById('add-exercise').addEventListener('click', () => {
            this.addExerciseToWorkout();
        });

        // Exercise library
        document.getElementById('add-custom-exercise').addEventListener('click', () => {
            this.openAddExerciseModal();
        });

        document.getElementById('add-exercise-form').addEventListener('submit', (e) => {
            this.handleAddExercise(e);
        });

        // Category filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterExercises(e.target.dataset.category);
            });
        });

        // Modal controls
        document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // History filter
        document.getElementById('history-filter').addEventListener('change', (e) => {
            this.filterHistory(e.target.value);
        });

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    // Tab switching
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Update specific content based on tab
        if (tabName === 'dashboard') {
            this.updateDashboard();
        } else if (tabName === 'exercises') {
            this.renderExercises();
        } else if (tabName === 'history') {
            this.renderHistory();
        }
    }

    // Workout management
    startWorkout() {
        this.currentWorkout = {
            id: Date.now(),
            startTime: new Date(),
            exercises: []
        };
        this.workoutStartTime = Date.now();
        
        // Update UI
        document.getElementById('start-workout').style.display = 'none';
        document.getElementById('end-workout').style.display = 'inline-flex';
        document.getElementById('workout-timer').style.display = 'block';
        document.getElementById('current-workout').style.display = 'block';
        document.getElementById('no-workout').style.display = 'none';
        
        // Populate exercise select
        this.populateExerciseSelect();
        
        // Start timer
        this.startTimer();
    }

    endWorkout() {
        if (!this.currentWorkout) return;

        // Calculate duration
        const duration = Date.now() - this.workoutStartTime;
        this.currentWorkout.endTime = new Date();
        this.currentWorkout.duration = duration;

        // Add to history
        this.workoutHistory.unshift(this.currentWorkout);
        
        // Reset workout state
        this.currentWorkout = null;
        this.workoutStartTime = null;
        
        // Stop timer
        this.stopTimer();
        
        // Update UI
        document.getElementById('start-workout').style.display = 'inline-flex';
        document.getElementById('end-workout').style.display = 'none';
        document.getElementById('workout-timer').style.display = 'none';
        document.getElementById('current-workout').style.display = 'none';
        document.getElementById('no-workout').style.display = 'block';
        document.getElementById('workout-exercises').innerHTML = '';
        
        // Save data and update dashboard
        this.saveData();
        this.updateDashboard();
        
        // Show success message
        this.showNotification('Workout completed! 🎉', 'success');
    }

    // Timer functionality
    startTimer() {
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.workoutStartTime;
            document.getElementById('timer').textContent = this.formatTime(elapsed);
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Exercise management
    populateExerciseSelect() {
        const select = document.getElementById('exercise-select');
        select.innerHTML = '<option value="">Select an exercise...</option>';
        
        this.exercises.forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.id;
            option.textContent = exercise.name;
            select.appendChild(option);
        });
    }

    addExerciseToWorkout() {
        const selectElement = document.getElementById('exercise-select');
        const exerciseId = selectElement.value;
        
        if (!exerciseId || !this.currentWorkout) return;
        
        const exercise = this.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return;
        
        // Add exercise to current workout
        const workoutExercise = {
            ...exercise,
            sets: []
        };
        
        this.currentWorkout.exercises.push(workoutExercise);
        const newIndex = this.currentWorkout.exercises.length - 1;
        
        // Render the exercise
        this.renderWorkoutExercise(workoutExercise, newIndex);

        // Add the first set
        this.addSet(newIndex);
        
        // Reset select
        selectElement.value = '';
    }

    renderWorkoutExercise(exercise, index) {
        const container = document.getElementById('workout-exercises');
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'workout-exercise';
        exerciseDiv.innerHTML = `
            <div class="exercise-header">
                <div>
                    <div class="exercise-name">${exercise.name}</div>
                    <div class="exercise-category">${exercise.category}</div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="app.removeExerciseFromWorkout(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="sets-container" id="sets-${index}">
                <!-- Sets will be added here -->
            </div>
            <button class="btn btn-secondary add-set-btn" onclick="app.addSet(${index})">
                <i class="fas fa-plus"></i> Add Set
            </button>
        `;
        
        container.appendChild(exerciseDiv);
        
        // Render existing sets
        this.rerenderExerciseSets(index);
    }

    _renderSet(exerciseIndex, setIndex) {
        const exercise = this.currentWorkout.exercises[exerciseIndex];
        const set = exercise.sets[setIndex];
        const setsContainer = document.getElementById(`sets-${exerciseIndex}`);
        const setDiv = document.createElement('div');
        setDiv.className = 'set-entry';

        let setHTML = `<div class="set-number">Set ${setIndex + 1}</div>`;

        if (exercise.type === 'weight') {
            setHTML += `
                <input type="number" class="set-input" placeholder="Weight" value="${set.weight}"
                       onchange="app.updateSet(${exerciseIndex}, ${setIndex}, 'weight', this.value)">
                <input type="number" class="set-input" placeholder="Reps" value="${set.reps}"
                       onchange="app.updateSet(${exerciseIndex}, ${setIndex}, 'reps', this.value)">
                <div></div>
            `;
        } else if (exercise.type === 'time') {
            setHTML += `
                <input type="number" class="set-input" placeholder="Time (sec)" value="${set.time}"
                       onchange="app.updateSet(${exerciseIndex}, ${setIndex}, 'time', this.value)">
                <div></div>
                <div></div>
            `;
        } else if (exercise.type === 'distance') {
            setHTML += `
                <input type="number" class="set-input" placeholder="Distance" value="${set.distance}"
                       onchange="app.updateSet(${exerciseIndex}, ${setIndex}, 'distance', this.value)">
                <input type="number" class="set-input" placeholder="Time (min)" value="${set.time}"
                       onchange="app.updateSet(${exerciseIndex}, ${setIndex}, 'time', this.value)">
                <div></div>
            `;
        }

        setHTML += `
            <button class="btn btn-danger btn-sm" onclick="app.removeSet(${exerciseIndex}, ${setIndex})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        setDiv.innerHTML = setHTML;
        setsContainer.appendChild(setDiv);
    }

    addSet(exerciseIndex) {
        const exercise = this.currentWorkout.exercises[exerciseIndex];
        exercise.sets.push({ weight: '', reps: '', time: '', distance: '' });
        this.rerenderExerciseSets(exerciseIndex);
    }

    updateSet(exerciseIndex, setIndex, field, value) {
        if (this.currentWorkout && this.currentWorkout.exercises[exerciseIndex] && this.currentWorkout.exercises[exerciseIndex].sets[setIndex]) {
            this.currentWorkout.exercises[exerciseIndex].sets[setIndex][field] = value;
        }
    }

    removeSet(exerciseIndex, setIndex) {
        if (this.currentWorkout && this.currentWorkout.exercises[exerciseIndex]) {
            this.currentWorkout.exercises[exerciseIndex].sets.splice(setIndex, 1);
            this.rerenderExerciseSets(exerciseIndex);
        }
    }

    removeExerciseFromWorkout(exerciseIndex) {
        if (this.currentWorkout) {
            this.currentWorkout.exercises.splice(exerciseIndex, 1);
            this.rerenderWorkoutExercises();
        }
    }

    rerenderExerciseSets(exerciseIndex) {
        const exercise = this.currentWorkout.exercises[exerciseIndex];
        if (!exercise) return;

        const setsContainer = document.getElementById(`sets-${exerciseIndex}`);
        setsContainer.innerHTML = '';

        exercise.sets.forEach((_, setIndex) => {
            this._renderSet(exerciseIndex, setIndex);
        });
    }

    rerenderWorkoutExercises() {
        const container = document.getElementById('workout-exercises');
        container.innerHTML = '';
        
        this.currentWorkout.exercises.forEach((exercise, index) => {
            this.renderWorkoutExercise(exercise, index);
        });
    }

    // Exercise library management
    openAddExerciseModal() {
        document.getElementById('add-exercise-modal').classList.add('active');
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        // Reset form
        document.getElementById('add-exercise-form').reset();
    }

    handleAddExercise(e) {
        e.preventDefault();
        
        const name = document.getElementById('exercise-name').value;
        const category = document.getElementById('exercise-category').value;
        const type = document.getElementById('exercise-type').value;
        
        if (!name || !category || !type) return;
        
        const newExercise = {
            id: Date.now().toString(),
            name,
            category,
            type
        };
        
        this.exercises.push(newExercise);
        this.saveData();
        this.renderExercises();
        this.closeModal();
        
        this.showNotification('Exercise added successfully!', 'success');
    }

    filterExercises(category) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Filter and render exercises
        this.renderExercises(category);
    }

    renderExercises(filterCategory = 'all') {
        const container = document.getElementById('exercises-list');
        container.innerHTML = '';
        
        const filteredExercises = filterCategory === 'all' 
            ? this.exercises 
            : this.exercises.filter(ex => ex.category === filterCategory);
        
        if (filteredExercises.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-dumbbell"></i>
                    <p>No exercises found in this category.</p>
                </div>
            `;
            return;
        }
        
        filteredExercises.forEach(exercise => {
            const exerciseCard = document.createElement('div');
            exerciseCard.className = 'exercise-card';
            exerciseCard.innerHTML = `
                <div class="exercise-card-header">
                    <div>
                        <div class="exercise-card-name">${exercise.name}</div>
                        <div class="exercise-card-category">${exercise.category}</div>
                    </div>
                </div>
                <div class="exercise-card-type">${this.getTypeLabel(exercise.type)}</div>
            `;
            container.appendChild(exerciseCard);
        });
    }

    getTypeLabel(type) {
        const labels = {
            weight: 'Weight & Reps',
            time: 'Time Based',
            distance: 'Distance'
        };
        return labels[type] || type;
    }

    // Dashboard and statistics
    updateDashboard() {
        const stats = this.calculateStats();
        
        document.getElementById('total-workouts').textContent = stats.totalWorkouts;
        document.getElementById('this-week').textContent = stats.thisWeek;
        document.getElementById('streak').textContent = stats.streak;
        document.getElementById('total-weight').textContent = stats.totalWeight.toLocaleString();
        
        this.renderRecentWorkouts();
    }

    calculateStats() {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const thisWeekWorkouts = this.workoutHistory.filter(workout => 
            new Date(workout.startTime) >= startOfWeek
        );
        
        const totalWeight = this.workoutHistory.reduce((total, workout) => {
            return total + workout.exercises.reduce((exerciseTotal, exercise) => {
                return exerciseTotal + exercise.sets.reduce((setTotal, set) => {
                    return setTotal + (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0);
                }, 0);
            }, 0);
        }, 0);
        
        const streak = this.calculateStreak();
        
        return {
            totalWorkouts: this.workoutHistory.length,
            thisWeek: thisWeekWorkouts.length,
            streak,
            totalWeight
        };
    }

    calculateStreak() {
        if (this.workoutHistory.length === 0) return 0;
        
        const sortedWorkouts = [...this.workoutHistory].sort((a, b) => 
            new Date(b.startTime) - new Date(a.startTime)
        );
        
        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        
        for (const workout of sortedWorkouts) {
            const workoutDate = new Date(workout.startTime);
            workoutDate.setHours(0, 0, 0, 0);
            
            if (workoutDate.getTime() === currentDate.getTime()) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (workoutDate.getTime() < currentDate.getTime()) {
                break;
            }
        }
        
        return streak;
    }

    renderRecentWorkouts() {
        const container = document.getElementById('recent-workouts-list');
        const recentWorkouts = this.workoutHistory.slice(0, 5);
        
        if (recentWorkouts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-dumbbell"></i>
                    <p>No workouts yet. Start your first workout!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        recentWorkouts.forEach(workout => {
            const workoutDiv = document.createElement('div');
            workoutDiv.className = 'workout-item';
            workoutDiv.innerHTML = `
                <div class="workout-item-header">
                    <div class="workout-date">${this.formatDate(workout.startTime)}</div>
                    <div class="workout-duration">${this.formatTime(workout.duration)}</div>
                </div>
                <div class="workout-exercises">
                    ${workout.exercises.map(ex => `<span class="exercise-tag">${ex.name}</span>`).join('')}
                </div>
            `;
            container.appendChild(workoutDiv);
        });
    }

    // History management
    renderHistory(filter = 'all') {
        const container = document.getElementById('history-list');
        let filteredWorkouts = [...this.workoutHistory];
        
        // Apply filter
        if (filter !== 'all') {
            const now = new Date();
            let cutoffDate;
            
            switch (filter) {
                case 'week':
                    cutoffDate = new Date(now);
                    cutoffDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    cutoffDate = new Date(now);
                    cutoffDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    cutoffDate = new Date(now);
                    cutoffDate.setFullYear(now.getFullYear() - 1);
                    break;
            }
            
            filteredWorkouts = filteredWorkouts.filter(workout => 
                new Date(workout.startTime) >= cutoffDate
            );
        }
        
        if (filteredWorkouts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No workout history found for this period.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        filteredWorkouts.forEach(workout => {
            const historyDiv = document.createElement('div');
            historyDiv.className = 'history-item';
            
            const totalSets = workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
            const totalWeight = workout.exercises.reduce((total, ex) => {
                return total + ex.sets.reduce((setTotal, set) => {
                    return setTotal + (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0);
                }, 0);
            }, 0);
            
            historyDiv.innerHTML = `
                <div class="history-item-header">
                    <div class="history-date">${this.formatDate(workout.startTime)}</div>
                    <div class="history-stats">
                        <span>Duration: ${this.formatTime(workout.duration)}</span>
                        <span>Exercises: ${workout.exercises.length}</span>
                        <span>Sets: ${totalSets}</span>
                        <span>Weight: ${totalWeight.toLocaleString()} lbs</span>
                    </div>
                </div>
                <div class="history-exercises">
                    ${workout.exercises.map(exercise => `
                        <div class="history-exercise">
                            <div class="history-exercise-name">${exercise.name}</div>
                            <div class="history-exercise-sets">
                                ${exercise.sets.map((set, index) => {
                                    if (exercise.type === 'weight') {
                                        return `Set ${index + 1}: ${set.weight}lbs × ${set.reps}`;
                                    } else if (exercise.type === 'time') {
                                        return `Set ${index + 1}: ${set.time}s`;
                                    } else if (exercise.type === 'distance') {
                                        return `Set ${index + 1}: ${set.distance}mi in ${set.time}min`;
                                    }
                                }).join('<br>')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(historyDiv);
        });
    }

    filterHistory(filter) {
        this.renderHistory(filter);
    }

    // Utility functions
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#6366f1'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Data persistence
    saveData() {
        const data = {
            exercises: this.exercises,
            workoutHistory: this.workoutHistory
        };
        localStorage.setItem('gymTrackerData', JSON.stringify(data));
    }

    loadData() {
        const savedData = localStorage.getItem('gymTrackerData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.exercises = data.exercises || [];
            this.workoutHistory = data.workoutHistory || [];
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GymTracker();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);