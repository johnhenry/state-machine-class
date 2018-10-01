# State Machine Class

**State Machine Class** is a generic state machine that can be used on its own or as a base class to create objects that must cleanly transitoin between states.

# Usage

## Installation

```shell
npm install --production state-machine-class
# use "--production" to avoid installing unnecessary development dependencies
```

## In Program

```javascript
const StateMachine = require("state-machine-class");
const transitions = {...};// List of permitted transitions between states.
const defaultState = "...";// Default state in which to start;
const cleanup = function(current){//Cleanup function
    this...
}
export default class extends StateMachine{
    constructor(){
        super(transitions, defaultState, cleanup);
    }
}
```

# API

## Constructor

```javascript
new StateMachine(transitions, defaulltState, cleanup, events);
```

### transitions:Object
The transition object represents avaliable transitions between states.

#### Truthy transitions
The ability to transition between states is defined by the truthiness of values in the transitions objects.
Given _state1_ and _state2_, and a transition object _transitions_, a transition is only allowed if the value of of _transitions[state1][state2]_ is truthy.

Example: Samptle transitons object
```javascript
const transitions = {
    "first-state":
    {
        "second-state":true,
        "third-state":true
    },
    "second-state":{
        "third-state":true
    }
}
```
In the above example, the state machine may be transion:

    - from "first-state" to "second-state" (transitions["first-state"]["second-state"] === true)
    - from "first-state" to "third-state" (transitions["first-state"]["third-state"] === true)
    - from "second-state" to "third-state" (transitions["second-state"]["third-state"] === true)

The state machine may NOT transion:

    - from "second-state" to "first-state" (transitions["second-state"]["first-state"] is undefined)
    - away from "third-state" at all. (transitions["third-state"] is undefined)

#### Functional transitions
If the value defined by two states within the transitions object is a function (instead of just being "truthy"),
it will be run before the transition completes.

If the function returns a _**FALSY**_ value, the transition happens smoothy.

Example: Sample transitons object with transition function
```javascript
const transitions = {
    "first-state":
    {
        "second-state":function(){
            return "";
        }
    }
}
```

If the function returns a _**TRUTHY**_ value, the transition will be interrupted and a warning will be emitted containing the value returned.

Example: Sample transitons object with "interrupted" transition function
```javascript
const transitions = {
    "first-state":
    {
        "second-state":function(){
            return "transition interrupted for demonstration!";
        }
    }
}
```

If the function throws an error, the state machine will die.

Example: Sample transitons object with transition function that kills state machine
```javascript
const transitions = {
    "first-state":
    {
        "second-state":function(){
            throw new Error();
        }
    }
}
```

### defaultState:String
The default state. This must be defined.

### cleanup:Function
This optional function runs after a state machine begins to die, but before it is fully dead meaning that it's state has yet to be nullified.
If defined as a non-arrow function, "this" will reference the state machine instance.

### events:Object
This set of events is passed to the constructor for the [Event Emitter Class](https://github.com/johnhenry/event-emitter-class) from which this class derives.


Example: Constructor
```javascript
const transtions ={
    "first-state":{
        "secons-state":true
    },
    "secons-state":{
        "first-state":true
    }
}
const sm = new StateMachine(transitions, "first-state");
```

## Instance Methods

### Statemachine#getState(stateName:string)

Gets the current state.

Example: getState
```javascript
sm.getState();
```

Also available as getter with sm.state;

Example: state (getter)
```javascript
sm.state;
```


### Statemachine#setState (stateName:string)

Attempts to set current state while invoking any transition handlers

Example: setState
```javascript
sm.setState("secons-state");
```

Also available as setter with sm.state.

Example: state (setter)
```javascript
sm.state = "secons-state";
```

### Statemachine#die(reason:string):
Puts state machine into a dead state where it will no longer transition.
Cleanup function will run if defined.


Example: die
```javascript
sm.die("reason for dying");
```

### Statemachine#dead:boolean

Getter that returns dead status

Example: die (getter)
```javascript
sm.dead;
```

## Events

### StateMachine.STATECHANGED
Emitted when state changes from one to anotuer
#### Emitted Specifically
    - At the end of a successful call to StateMachine#.setState
#### Payload
    - Original State
    - New State

### StateMachine.WARNING
Emitted when a warning is thrown but state machine does not transition into from being alive to dead.
#### Emitted Specifically
    - An attempt to transiton into a falsy state
    - An attempt to transition into a state that the machine is alredy in
    - An attempt to transition into a state that is ot allowed
    - A transition function is interrupted for a user defined reason (truthy return)
    - An attempt to get the state of a dead state machine is made
    - An attempt to set the state of a dead state machine is made
#### Payload
    - Message indicatating what happened

### StateMachine.ERROR
Emitted when a state machine throw an error
Note: Stete machine will die after emitting this error, even when forced to emait
#### Emitted Specifically
    - A transition function throws an error
#### Payload
    - Error Message

### StateMachine.DYING
Emmited when a state machine starts to die.
#### Emitted Specifically
    - At the beginning of a call to StateMachine#.die
#### Payload
    - (Optional) reason for dying

### StateMachine.DEAD
Emmited when a state machine has died.
#### Emitted Specifically
    - At the end of a call to StateMachine#.die
#### Payload
    - Result of a user defined cleanup function

# Development

## NPM Scripts

### test
runs tests

## Testing
Tests can be run with `node test`, `npm run test`, or `npm test`

### TAP
Because test output in the standard TAP format, there are a number of existing utilities that exist to format the output

Example: HTML Output
```shell
npm test | npx  tap-html --out ./tap-html.html
```

Example: Graphical Output
```shell
npm test | npx tap-nyan
 17  -_-_-_-_-_-_-_-_-_,------,
 0   -_-_-_-_-_-_-_-_-_|   /\_/\
 0   -_-_-_-_-_-_-_-_-^|__( ^ .^)
     -_-_-_-_-_-_-_-_-  ""  ""
 Pass!
```
