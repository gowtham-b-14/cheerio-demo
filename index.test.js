const html = require('./index')

test('Properly gerenrates PDF',()=>{
    expect(html('https://reactnative.dev/blog'))
})