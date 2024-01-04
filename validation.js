
module.exports = {
    /**
     * Function to check if the task name is in valid format.
     * @param {String} taskName 
     * @returns {Boolean} whether the given task name is valid or not
     */
    isValidTaskIdentifier: function isValidTaskIdentifier(taskName) {
        try {
            let constants = require('./constants');
            const regex = constants.VALID_TASK_NAME_REGEX;
            return regex.test(taskName);
        } catch (error) {
            process.stderr.write('Sorry! Some error occured', error.message);
            process.exit(1);
        }
    },

    /**
     * Function to determine validity of tasks in each Group.
     * @param {Array} group containing Tasks
     * @param {Map} tasks details with its dependencies in Map format
     * @returns {Boolean} given task is valid or not.
     */
    validateAndPopulateTasks: function validateAndPopulateTasks(group, tasks) {
        try {
            const taskSet = new Set();

            for (const line of group) {
                const parts = line.split(':');

                // Check for correct task format
                if (parts.length !== 2) {
                    console.error('Error Occured: Invalid task format:', line);
                    return false;
                }

                const task = parts[0];
                const dependencies = parts[1].split(',');

                if (!this.isValidTaskIdentifier(task)) {
                    console.error('Error Occured: Task name is not valid:', line);
                    return false;
                }
                if (task === dependencies.join(",")) {
                    console.error('Error Occured: Invalid entry found', line);
                    return false;
                }


                // Check for valid dependencies within the current group
                for (const dep of dependencies) {
                    if (dep !== '' && group.filter(element => element.split(":")[0] === dep).length > 1) {
                        console.error(`Error Occured: Duplicate task entry '${task}' detected. Task ${dep} has duplicate entry`, line);
                        return false;
                    }
                    if (dep !== '' && group.filter(element => element.split(":")[0] === dep).length != 1) {
                        console.error(`Error Occured: Dependency on non-existent task detected. Task ${dep} doesn't exist in below group`);
                        console.log(group);
                        return false;
                    }
                }

                tasks.set(task, dependencies);
                taskSet.add(task);
                // Check for circular dependencies
                if (this.hasCircularDependency(task, dependencies, tasks, new Set())) {
                    console.error('Error Occured: Circular dependency detected:', line);
                    return false;
                }
            }
            return true;
        } catch (error) {
            process.stderr.write('Sorry! Some error occured', error.message);
            process.exit(1);
        }
    },

    /**
     * Function to check if the task has circular dependency
     * @param {String} currentTask that need to be checked for circular dependency 
     * @param {Array} dependencies dependency list of current task
     * @param {Map} tasks defined in this group
     * @param {set} executed task 
     * @returns {Boolean} Whether the given task has circular dependency or not.
     */
    hasCircularDependency: function hasCircularDependency(currentTask, dependencies, tasks, executed) {
        try {
            if (executed.has(currentTask)) {
                return true;
            }

            executed.add(currentTask);

            for (const dep of dependencies) {
                if (tasks.has(dep) && hasCircularDependency(dep, tasks.get(dep), tasks, executed)) {
                    return true;
                }
            }

            executed.delete(currentTask);
            return false;
        } catch (error) {
            process.stderr.write('Sorry! Some error occured', error.message);
            process.exit(1);
        }
    },


}