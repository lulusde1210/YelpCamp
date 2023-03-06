module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(e => next(e));
    }
}



// or you can write like this

// module.exports = function (func) {
//     return function (req, res, next) {
//         func(req, res, next).catch(e => next(e));
//     }
// }