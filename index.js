const readline = require('readline');
let validation = require('./validation');
const { error } = require('console');
/**
 * Master function to validate task formats and determine Task ordering
 * @param {Array} text input text stream
 * @returns {String} Task order
 */
function processTasks(input) {
  try {
  const taskGroups = [];
  let currentGroup = [];
  /**
   * iterating over the input array to segregate groups and its tasks.
   * While iterating whenever an empty line is encountered, 
   * using that as a delimiter and pushing all the successive valid entries after the new line in to new group
   *  */
  input.forEach(line => {

    if (line.trim() === '' && currentGroup.length > 0) {
      taskGroups.push(currentGroup);
      currentGroup = [];
    } else if (!line.startsWith('#') && line.trim() !== '') {
      currentGroup.push(line.trim());
    }
  });

  // Finalize the last group if not empty
  if (currentGroup.length > 0) {
    taskGroups.push(currentGroup);
  }

  // Determining task order for Each group
  let output = "";
  taskGroups.forEach(group => {
    const tasks = new Map();

    // Validate and populate the tasks map
    if (!validation.validateAndPopulateTasks(group, tasks)) {
      process.stderr.write('Sorry! Due to Invalid input. Process got stopped.');
      process.exit(1);
    }

    const sortedTasks = topologicalSort(tasks);
    output += sortedTasks.join(' ') + "\n";


  });
  process.stdout.write(output);

} catch (error) {
  process.stderr.write('Sorry! Some error occured',error.message);
  process.exit(1);
}
}


/**
*Function to determine the order of task
* @param {taskMap} Map that contains task and its dependencies
* @returns {Array} order of tasks.
*/
function topologicalSort(taskMap) {
  try {
  const executed = new Set();
  const result = [];

  function execute(node) {
    if (executed.has(node)) return;

    executed.add(node);

    const dependencies = taskMap.get(node) || [];
    dependencies.forEach(dependency => execute(dependency));

    result.push(node);
  }

  for (const node of taskMap.keys()) {
    execute(node);
  }

  return result;
} catch (error) {
  process.stderr.write('Sorry! Some error occured',error.message);
  process.exit(1);
}
}

/**
 * Function to read input from the user
 * @returns {Promise} Array of lines inputted by the user
 */
function readInput() {
    try {
  const lines = [];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (line) => {
    
      lines.push(line);
  });

  return new Promise((resolve) => {
    rl.on('close', () => {
      resolve(lines);
    });
  }); 
} catch (error) {
    process.stderr.write('Sorry! some error occured while processing your input', e);
      process.exit(1);
}
}
/**
 * Initial function to read input from user.
 */
async function main() {
  const inputLines = await readInput();
 processTasks(inputLines);
}
main();
