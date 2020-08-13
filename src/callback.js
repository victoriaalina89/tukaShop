function sayHi(name, lastName, greeter) {
    fullName = lastName + ', ' + name
    greeter(fullName)
}

sayHi('Victoria', 'Jimenez', (name) => console.log('Como andai ' + name))

sayHi('Victoria', 'Jimenez', (name) => console.log('How do you do ' + name))



collection = {
    items: [2,3],
    add: item => this.items.push(item),
    map: (functionModificadora) => {
        for (let i=0; i<this.items.length; i++) {
            items[i] = functionModificadora(items[i]) 
            console.log(funcionModificador(1))
        }
    },
}

collection.add(1);
collection.add(2);

collection.map(numero => numero++);



function multiplier(factor) {
    return x => x * factor
};

const dobler = multiplier(2);
const tripler = multiplier(3);

console.log(dobler(12));
console.log(tripler(30));

