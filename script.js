/* --- DATA SOURCE --- */
const projects = [
    {
        id: 1,
        title: "AI Study Group Helper",
        desc: "We are building a Python bot to summarize lecture notes for students. Looking for a backend developer familiar with NLP.",
        members: "2/4 Members",
        tags: ["Python", "AI", "NLP"]
    },
    {
        id: 2,
        title: "GreenEarth Mobile App",
        desc: "A React Native app to track daily carbon footprint. We need a UI designer and a frontend developer.",
        members: "1/3 Members",
        tags: ["React Native", "Figma", "Mobile"]
    },
    {
        id: 3,
        title: "Campus Marketplace",
        desc: "Web platform for students to buy and sell used books securely. Need a full stack MERN developer.",
        members: "3/5 Members",
        tags: ["MongoDB", "Express", "React"]
    }
];

/* --- FUNCTIONS --- */

// 1. Login Logic
function handleLogin(event) {
    event.preventDefault(); // Stop form from refreshing page
    
    const username = document.getElementById('username-input').value;
    
    if(username) {
        // Update the welcome message
        document.getElementById('user-display').innerText = username;
        
        // Hide Login, Show App
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        
        // Load the projects
        renderProjects();
    }
}

// 2. Logout Logic
function handleLogout() {
    // Clear input
    document.getElementById('username-input').value = '';
    
    // Show Login, Hide App
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-screen').classList.add('hidden');
}

// 3. Render Projects to the Screen
function renderProjects() {
    const container = document.getElementById('feed-container');
    container.innerHTML = ''; // Clear previous content

    projects.forEach(project => {
        // Create HTML for each card
        const cardHTML = `
            <div class="project-card">
                <div class="card-header">
                    <h3 class="project-title">${project.title}</h3>
                    <span class="members-count">${project.members}</span>
                </div>
                <p class="project-desc">${project.desc}</p>
                <div class="tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <button class="btn-join" onclick="handleJoin(this, '${project.title}')">Request to Join</button>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// 4. Join Button Logic
function handleJoin(button, projectTitle) {
    // Change button style
    button.innerText = "Request Sent ✓";
    button.classList.add('requested');
    button.disabled = true; // Prevent clicking again

    // Show alert
    alert(`✅ Success!\n\nYour request to join "${projectTitle}" has been sent to the project lead.`);
}