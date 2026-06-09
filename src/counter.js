// // super() initializes the parent React.Component
// // super(props) lets you access this.props inside the constructor
// // constructor is a special method for creating and initializing an object created with a class. In React, it's used to set up the initial state and bind methods.
// // "this" keyword points to the current component instance (actual version of the component displayed on the screen)
// import React from "react";

// class Counter extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = { count: 5 };
//     // Binding this keyword manually to access  our event functions
//     this.handleDecrement = this.handleDecrement.bind(this);
//     this.handleIncrement = this.handleIncrement.bind(this)
//   }
//     // handlers functions are defined as class methods 
//   handleDecrement() { 
//     this.setState((curState) => {
//       return { count: curState.count - 1 }
//     })
//   }

//   handleIncrement() { 
//     this.setState((curState) => {
//       return { count: curState.count + 1 }
//     })
//   }

//   render() {
//     const date = new Date("june 21 2027")
//     date.setDate(date.getDate() + this.state.count)

//     return (
//       <div>
//         <button onClick={this.handleDecrement}>-</button>
//         <span>
//         {date.toDateString()} [{this.state.count}]
//           </span>
//         <button onClick={this.handleIncrement}>+</button>
//       </div>
//     );
//   }
// }

// export default Counter;