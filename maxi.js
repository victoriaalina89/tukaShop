function query(query, callback) {
    // pienso, obtengo los datos
    // ...
    // termine
    callback([1,2]);
}

// query('ids', ids => console.log(ids));

function queryConPromise(query) {
    return new Promise((resolve, reject) => {
        try {
            // pienso, obtengo los datos
            // ...
            // termine
        } catch(error) {
            reject(error);
        }
        
        resolve([1,2]);
    });
}

// const resultado = queryConPromise('ids');

// resultado.then(function (ids) {
//     // console.log(ids);
//     return ids;
// });


async function queryConAsync(query) {
    // pienso, obtengo los datos
    // ...
    // termine
    return [1,2];
}

// const resultado = queryConAsync('ids');

// resultado.then(function (ids) {
//     console.log(ids);
//     // return ids;
// });


async function main() {
    const ids = await queryConPromise('ids');
    const ids2 = await queryConAsync('ids');

    console.log(ids, ids2);
}

main();








