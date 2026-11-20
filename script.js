
"use strict";

// =====================================
// 1. TASK STORAGE
// =====================================

let tasks = [];

const MAX_EXACT_TASKS = 12;

const explanations = {
    brute: {
        name: "Brute Force",
        time: "O((D+1)^n)",
        space: "O(n + D)",
        steps: [
            "Start with an empty schedule.",
            "Consider every task one by one.",
            "Try assigning the task to each available day before its deadline.",
            "Also consider skipping the task.",
            "Compare all possible schedules and keep the highest score."
        ]
    },

    greedy: {
        name: "Greedy Algorithm",
        time: "O(n log n + nD)",
        space: "O(n + D)",
        steps: [
            "Sort all tasks by priority from highest to lowest.",
            "Select the highest-priority task.",
            "Find the latest available day before its deadline.",
            "Assign the task to that day.",
            "Repeat until all tasks have been considered."
        ]
    },

    dp: {
        name: "Dynamic Programming",
        time: "O(n × 2^n)",
        space: "O(n × 2^n)",
        steps: [
            "Create a table representing subsets of tasks.",
            "Start with an empty schedule and score zero.",
            "Add an unscheduled task if its deadline permits.",
            "Store the best schedule for each task subset.",
            "Choose the subset with the highest priority score."
        ]
    },

    backtracking: {
        name: "Backtracking",
        time: "O((D+1)^n)",
        space: "O(n + D)",
        steps: [
            "Start with an empty schedule.",
            "Try assigning a task to an available day.",
            "Explore the remaining tasks recursively.",
            "Undo a choice and explore another possibility.",
            "Prune branches that cannot improve the best score."
        ]
    }
};

// =====================================
// 2. HELPER FUNCTIONS
// =====================================

function getMaxDay() {
    if (tasks.length === 0) return 0;

    return Math.min(
        tasks.length,
        Math.max(...tasks.map(task => task.deadline))
    );
}

function calculateScore(schedule) {
    return schedule.reduce(
        (sum, task) => sum + task.priority,
        0
    );
}

function showMessage(message, type) {
    const element = document.getElementById("message");

    element.textContent = message;
    element.className = "message " + type;
}

// =====================================
// 3. ADD TASK
// =====================================

document.getElementById("taskForm").addEventListener(
    "submit",
    function(event) {
        event.preventDefault();

        const name = document.getElementById("taskName")
            .value.trim();

        const deadlineValue =
            document.getElementById("deadline").value;

        const priorityValue =
            document.getElementById("priority").value;

        const deadline = Number(deadlineValue);
        const priority = Number(priorityValue);

        if (!name) {
            showMessage("Please enter a task name.", "error");
            return;
        }

        if (
            deadlineValue === "" ||
            !Number.isSafeInteger(deadline) ||
            deadline < 1
        ) {
            showMessage(
                "Deadline must be a positive whole number.",
                "error"
            );
            return;
        }

        if (
            priorityValue === "" ||
            !Number.isInteger(priority) ||
            priority < 1 ||
            priority > 10
        ) {
            showMessage(
                "Priority must be between 1 and 10.",
                "error"
            );
            return;
        }

        if (
            tasks.some(
                task => task.name.toLowerCase() === name.toLowerCase()
            )
        ) {
            showMessage("This task already exists.", "error");
            return;
        }

        tasks.push({
            id: Date.now() + Math.random(),
            name: name,
            deadline: deadline,
            priority: priority
        });

        showMessage("Task added successfully!", "success");

        this.reset();

        displayTasks();
        clearResults();
    }
);

// =====================================
// 4. DISPLAY TASKS
// =====================================

function displayTasks() {
    const list = document.getElementById("taskList");

    list.replaceChildren();

    document.getElementById("taskCount").textContent =
        "Total tasks: " + tasks.length;

    if (tasks.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.className = "empty";
        cell.textContent = "No tasks added yet.";

        row.appendChild(cell);
        list.appendChild(row);

        return;
    }

    tasks.forEach(task => {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = task.name;

        const deadlineCell = document.createElement("td");
        deadlineCell.textContent = task.deadline;

        const priorityCell = document.createElement("td");
        priorityCell.textContent = task.priority;

        const actionCell = document.createElement("td");

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {
            tasks = tasks.filter(item => item.id !== task.id);

            displayTasks();
            clearResults();

            showMessage("Task deleted.", "success");
        });

        actionCell.appendChild(deleteButton);

        row.append(
            nameCell,
            deadlineCell,
            priorityCell,
            actionCell
        );

        list.appendChild(row);
    });
}

// =====================================
// 5. CLEAR ALL TASKS
// =====================================

document.getElementById("clearBtn").addEventListener(
    "click",
    function() {
        tasks = [];

        displayTasks();
        clearResults();

        showMessage("All tasks cleared.", "success");
    }
);

// =====================================
// 6. GREEDY ALGORITHM
// =====================================

function greedyAlgorithm() {
    const sorted = [...tasks].sort((a, b) =>
        b.priority - a.priority ||
        a.deadline - b.deadline
    );

    const maxDay = getMaxDay();

    const slots = Array(maxDay).fill(null);

    for (const task of sorted) {

        const lastDay = Math.min(task.deadline, maxDay);

        for (let day = lastDay - 1; day >= 0; day--) {

            if (slots[day] === null) {
                slots[day] = {
                    ...task,
                    day: day + 1
                };

                break;
            }
        }
    }

    return slots.filter(Boolean);
}

// =====================================
// 7. BRUTE FORCE ALGORITHM
// =====================================

function bruteForceAlgorithm() {
    const maxDay = getMaxDay();

    let bestScore = 0;
    let bestSchedule = [];

    const used = Array(maxDay).fill(false);
    const schedule = [];

    function solve(index, score) {

        if (index === tasks.length) {

            if (score > bestScore) {
                bestScore = score;
                bestSchedule = [...schedule];
            }

            return;
        }

        const task = tasks[index];

        // Option 1: Skip this task
        solve(index + 1, score);

        // Option 2: Assign this task to an available day
        const lastDay = Math.min(task.deadline, maxDay);

        for (let day = 0; day < lastDay; day++) {

            if (!used[day]) {

                used[day] = true;

                schedule.push({
                    ...task,
                    day: day + 1
                });

                solve(
                    index + 1,
                    score + task.priority
                );

                schedule.pop();
                used[day] = false;
            }
        }
    }

    solve(0, 0);

    return bestSchedule;
}

// =====================================
// 8. DYNAMIC PROGRAMMING ALGORITHM
// =====================================

function dpAlgorithm() {
    const n = tasks.length;
    const maxDay = getMaxDay();

    const totalStates = 1 << n;

    const dp = new Array(totalStates).fill(null);

    dp[0] = {
        score: 0,
        schedule: []
    };

    for (let mask = 0; mask < totalStates; mask++) {

        if (dp[mask] === null) continue;

        // Count the tasks already selected
        let day = 0;

        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                day++;
            }
        }

        if (day >= maxDay) continue;

        // Try adding every unused task
        for (let i = 0; i < n; i++) {

            if (mask & (1 << i)) continue;

            const task = tasks[i];

            if (task.deadline < day + 1) continue;

            const nextMask = mask | (1 << i);

            const newScore =
                dp[mask].score + task.priority;

            if (
                dp[nextMask] === null ||
                newScore > dp[nextMask].score
            ) {

                dp[nextMask] = {
                    score: newScore,
                    schedule: [
                        ...dp[mask].schedule,
                        {
                            ...task,
                            day: day + 1
                        }
                    ]
                };
            }
        }
    }

    let best = {
        score: 0,
        schedule: []
    };

    for (const state of dp) {

        if (
            state !== null &&
            state.score > best.score
        ) {
            best = state;
        }
    }

    return best.schedule;
}

// =====================================
// 9. BACKTRACKING ALGORITHM
// =====================================

function backtrackingAlgorithm() {
    const maxDay = getMaxDay();

    let bestScore = 0;
    let bestSchedule = [];

    const used = Array(maxDay).fill(false);
    const schedule = [];

    // Calculate remaining possible priority
    const remaining = new Array(tasks.length + 1).fill(0);

    for (let i = tasks.length - 1; i >= 0; i--) {
        remaining[i] =
            remaining[i + 1] + tasks[i].priority;
    }

    function search(index, score) {

        // Prune branches that cannot beat the best score
        if (score + remaining[index] <= bestScore) {
            return;
        }

        if (index === tasks.length) {

            bestScore = score;
            bestSchedule = [...schedule];

            return;
        }

        const task = tasks[index];

        // Option 1: Skip task
        search(index + 1, score);

        // Option 2: Try available days
        const lastDay = Math.min(task.deadline, maxDay);

        for (let day = 0; day < lastDay; day++) {

            if (!used[day]) {

                used[day] = true;

                schedule.push({
                    ...task,
                    day: day + 1
                });

                search(
                    index + 1,
                    score + task.priority
                );

                schedule.pop();
                used[day] = false;
            }
        }
    }

    search(0, 0);

    return bestSchedule;
}

// =====================================
// 10. DISPLAY ALGORITHM RESULT
// =====================================

function runAlgorithm(type) {

    const resultDiv = document.getElementById("result");

    if (tasks.length === 0) {
        resultDiv.textContent =
            "Please add tasks before running an algorithm.";
        return;
    }

    if (
        tasks.length > MAX_EXACT_TASKS &&
        type !== "greedy"
    ) {
        resultDiv.textContent =
            "Please use 12 or fewer tasks for this algorithm.";
        return;
    }

    const info = explanations[type];

    if (!info) return;

    const start = performance.now();

    const schedule = algorithms[type]();

    const executionTime = performance.now() - start;

    displayResult(
        info,
        schedule,
        executionTime
    );

    // Highlight selected algorithm
    document.querySelectorAll(".algorithm-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.algorithm === type
        );
    });
}

function algorithmsRunner(type) {
    const methods = {
        brute: bruteForceAlgorithm,
        greedy: greedyAlgorithm,
        dp: dpAlgorithm,
        backtracking: backtrackingAlgorithm
    };

    return methods[type]();
}

// Convenient algorithm lookup
const algorithms = {
    brute: bruteForceAlgorithm,
    greedy: greedyAlgorithm,
    dp: dpAlgorithm,
    backtracking: backtrackingAlgorithm
};

// =====================================
// 11. RENDER RESULT
// =====================================

function displayResult(info, schedule, executionTime) {

    const resultDiv = document.getElementById("result");

    const score = calculateScore(schedule);

    resultDiv.replaceChildren();

    const header = document.createElement("div");
    header.className = "result-header";

    const title = document.createElement("h3");
    title.textContent = info.name;

    const subtitle = document.createElement("p");
    subtitle.textContent =
        "Your scheduling result is ready.";

    header.append(title, subtitle);

    const metrics = document.createElement("div");
    metrics.className = "result-metrics";

    const metricData = [
        ["Total Priority", score],
        ["Selected Tasks", schedule.length],
        ["Execution Time", executionTime.toFixed(4) + " ms"]
    ];

    metricData.forEach(([label, value]) => {

        const box = document.createElement("div");
        box.className = "metric";

        const name = document.createElement("span");
        name.textContent = label;

        const number = document.createElement("strong");
        number.textContent = value;

        box.append(name, number);
        metrics.appendChild(box);
    });

    const explanation = document.createElement("div");
    explanation.className = "explanation";

    const explanationTitle = document.createElement("h4");
    explanationTitle.textContent = "How This Algorithm Works";

    const steps = document.createElement("ol");

    info.steps.forEach(step => {
        const item = document.createElement("li");
        item.textContent = step;
        steps.appendChild(item);
    });

    explanation.append(explanationTitle, steps);

    const complexity = document.createElement("div");
    complexity.className = "explanation";

    const complexityTitle = document.createElement("h4");
    complexityTitle.textContent = "Complexity Analysis";

    const time = document.createElement("p");
    time.textContent = "Time Complexity: " + info.time;

    const space = document.createElement("p");
    space.textContent = "Space Complexity: " + info.space;

    complexity.append(complexityTitle, time, space);

    const taskSection = document.createElement("div");
    taskSection.className = "result-tasks";

    const taskTitle = document.createElement("h4");
    taskTitle.textContent = "Selected Tasks";

    taskSection.appendChild(taskTitle);

    if (schedule.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No tasks scheduled.";
        taskSection.appendChild(empty);
    }

    [...schedule]
        .sort((a, b) => a.day - b.day)
        .forEach(task => {

            const row = document.createElement("div");
            row.className = "result-task";

            const taskName = document.createElement("span");
            taskName.textContent =
                "Day " + task.day + ": " + task.name;

            const badge = document.createElement("span");
            badge.className = "score-badge";
            badge.textContent =
                "Priority " + task.priority;

            row.append(taskName, badge);

            taskSection.appendChild(row);
        });

    resultDiv.append(
        header,
        metrics,
        explanation,
        complexity,
        taskSection
    );
}

// =====================================
// 12. COMPARE ALL ALGORITHMS
// =====================================

document.getElementById("compareBtn").addEventListener(
    "click",
    compareAlgorithms
);

function compareAlgorithms() {

    const output = document.getElementById("comparison");

    output.replaceChildren();

    if (tasks.length === 0) {
        output.textContent = "Please add tasks first.";
        return;
    }

    if (tasks.length > MAX_EXACT_TASKS) {
        output.textContent =
            "Please use 12 or fewer tasks for comparison.";
        return;
    }

    const methods = [
        ["brute", "Brute Force"],
        ["greedy", "Greedy"],
        ["dp", "Dynamic Programming"],
        ["backtracking", "Backtracking"]
    ];

    const comparisonTitle = document.createElement("h3");
    comparisonTitle.textContent = "Algorithm Comparison";

    const grid = document.createElement("div");
    grid.className = "comparison-grid";

    const results = [];

    methods.forEach(([type, name]) => {

        const start = performance.now();

        const schedule = algorithms[type]();

        const elapsed = performance.now() - start;

        results.push({
            name: name,
            score: calculateScore(schedule),
            time: elapsed
        });

        const item = document.createElement("div");
        item.className = "comparison-item";

        const heading = document.createElement("h4");
        heading.textContent = name;

        const score = document.createElement("p");
        score.textContent =
            "Total Priority: " +
            calculateScore(schedule);

        const count = document.createElement("p");
        count.textContent =
            "Tasks Scheduled: " + schedule.length;

        const runtime = document.createElement("p");
        runtime.textContent =
            "Execution Time: " + elapsed.toFixed(4) + " ms";

        item.append(heading, score, count, runtime);

        grid.appendChild(item);
    });

    const optimalScore = Math.max(
        ...results
            .filter(result =>
                result.name !== "Greedy Algorithm"
            )
            .map(result => result.score)
    );

    const note = document.createElement("p");
    note.className = "complexity-note";
    note.textContent =
        "Best score: " + optimalScore +
        ". Greedy is a heuristic and may return a different score. " +
        "Execution times are measured locally and may vary.";

    output.append(comparisonTitle, grid, note);
}

// =====================================
// 13. CLEAR OLD RESULTS
// =====================================

function clearResults() {

    document.getElementById("result").innerHTML = `
        <div class="empty-result">
            <div class="empty-icon">📊</div>
            <h3>No Results Yet</h3>
            <p>Add tasks and select an algorithm to see results.</p>
        </div>
    `;

    document.getElementById("comparison").textContent =
        "Your comparison will appear here.";

    document.querySelectorAll(".algorithm-btn").forEach(button => {
        button.classList.remove("active");
    });
}

// =====================================
// 14. ALGORITHM BUTTON EVENTS
// =====================================

document.querySelectorAll(".algorithm-btn").forEach(button => {

    button.addEventListener("click", function() {

        const type = this.dataset.algorithm;

        runAlgorithm(type);
    });
});

// =====================================
// 15. INITIAL DISPLAY
// =====================================

displayTasks();
