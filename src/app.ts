
import express, {Request, Response, NextFunction} from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import nocache from 'nocache';

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(nocache());

app.use('/static', express.static(path.join(__dirname, 'assets')));

app.listen(port, (err?: Error) => {
    if (err) {
        console.log("Error connecting to the server");
    } else {
        console.log("Server running on: http://localhost:3000");
    }
});

////////////////////////////

class Task {
    private id: number;
    private title: string;
    private description: string;
    private isCompleted: boolean;

    constructor (id: number, title: string, description:string) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.isCompleted = false;
    }

    // Getters
    public getId(): number {
        return this.id;
    }

    public getTitle(): string {
        return this.title;
    }

    public getDescription(): string {
        return this.description;
    }

    public getStatus(): boolean {
        return this.isCompleted;
    }

    // Setters
    public setTitle(title: string): void {
        this.title = title;
    }

    public setDescription(description: string): void {
        this.description = description;
    }

    public markAsComplete(): void {
        this.isCompleted = true;
    }
    
    public markAsIncomplete(): void {
        this.isCompleted = false;
    }

    public displayTask(): void {
        let status = this.isCompleted ? 'Completed' : 'Incomplete';
        console.log(`${this.title} - ${status}`);
    }
}

class TaskManager {
    private tasks: Task[] = [];
    private nextId: number = 1;

    public getTasks(): Task[] {
        return this.tasks;
    }

    // Add new task
    public addTask(title: string, description: string): void {
        const newTask = new Task(this.nextId, title, description);
        this.tasks.push(newTask);
        this.nextId++;
        console.log(`Task added - ${title}`);
    }

    public removeTask(taskId: number): void {
        this.tasks = this.tasks.filter(task => task.getId() !== taskId);
        console.log(`Task with id '${taskId}' was removed!`);
    }

    public getTask(taskId: number): Task | undefined {
        return this.tasks.find(task => task.getId() === taskId);
    }

    public displayTasks(): void {
        if (this.tasks.length === 0) {
            console.log("No tasks available");
        } else {
            this.tasks.forEach(task => task.displayTask());
        }
    }

    public completeTask(taskId: number): void {
        const task = this.tasks.find(task => task.getId() === taskId);
        if (task) {
            task.markAsComplete();
            console.log(`Task with id '${taskId}' marked as completed!`);
        } else {
            console.log(`Task with id '${taskId}' not found!`);
        }
    }

    public inCompleteTask(taskId: number): void {
        const task = this.tasks.find(task => task.getId() === taskId);
        if (task) {
            task.markAsIncomplete();
            console.log(`Task with id '${taskId}' marked as incomplete!`);
        } else {
            console.log(`Task with id '${taskId}' not found!`);
        }
    }
}

////////////////////////////

const taskManager = new TaskManager();

app.get('/', (req: Request, res: Response) => {
    res.redirect('/home');
});

app.get('/home', (req: Request, res: Response) => {
    const tasks = taskManager.getTasks();
    const incompleteTasks = tasks.filter(task => task.getStatus() !== true);
    const completedTasks = tasks.filter(task => task.getStatus() !== false);
    console.log(taskManager.getTasks());
    res.render('home', { completedTasks, incompleteTasks });
});

app.post('/addTask', (req: Request, res: Response) => {
    const { title, desc } = req.body;
    taskManager.addTask(title, desc);
    res.json({ success: true });
});

app.post('/updateTaskStatus', (req: Request, res: Response) => {
    const { title, isCompleted } = req.body;
    const task = taskManager.getTasks().find(task => task.getTitle() === title);
    if (task) {
        if(isCompleted) {
            task.markAsComplete();
        } else {
            task.markAsIncomplete();
        }

        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Task not found' });
    }
});

app.patch('/editTask', (req: Request, res: Response) => {
    const { taskId, title, desc } = req.body;
    const numericTaskId = parseInt(taskId, 10);
  
    const task = taskManager.getTask(numericTaskId);
    if (task) {
      task.setTitle(title);
      task.setDescription(desc);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Task not found' });
    }
});

app.delete('/deleteTask', (req: Request, res: Response) => {
    const { taskId } = req.body;

    const numericTaskId = parseInt(taskId, 10);

    if (isNaN(numericTaskId)) {
        res.status(400).json({ success: false, message: 'Invalid task ID' });
    }

    const task = taskManager.getTask(numericTaskId);

    if (task) {
        taskManager.removeTask(numericTaskId);
        res.status(200).json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Task not found' });
    }
});


////////////////////////////