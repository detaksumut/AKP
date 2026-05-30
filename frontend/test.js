const text = '{ "a": 1 }';
const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
console.log(match ? match[1] : 'null');
