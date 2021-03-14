const Airtable = require('airtable')
const apiKey = 'Your Api Key'
const id = 'Your id'
const base = new Airtable({ apiKey: apiKey }).base(id)
const fs = require('fs')
const path = require('path')
const nodePath = path.resolve(__dirname)

// if view equal 'Grid view'
const view = 'Grid view'

let records = []

// called for every page of records
let processPage = (partialRecords, fetchNextPage) => {
  records = [...records, ...partialRecords]
  fetchNextPage()
}

// called when all the records have been retrieved
let processRecords = err => {
  if (err) {
    console.error(err)
    return
  }
  let formTitleList = records[0].fields

  // black array
  let blackList = [
    // such as like these...
    'Link to the page',
    'Status',
    'EDITED',
    'Updates'
  ]
  // filter
  let allLanguage = []
  for (let item in formTitleList) {
    if (blackList.includes(item)) {
      continue
    } else {
      allLanguage.push(item)
    }
  }
  let arr1 = []
  records.forEach(function(record) {
    blackList.forEach(function(black) {
      if (record.fields[black]) {
        delete record.fields[black]
      }
    })
  })
  records.forEach(function(record) {
    if (Object.keys(record.fields).length > 0) {
      arr1.push(record.fields)
    }
  })
  let exportEStr = ''
  for (let lang = 0; lang < allLanguage.length; lang++) {
    let exportLStr = ''
    for (let j = 0; j < arr1.length; j++) {
      let key = arr1[j]['Your Key Title'].replace(/[\r\n]/g, '').replace(/"/g, '\\"') ? arr1[j]['Your Key Title'].replace(/[\r\n]/g, '').replace(/"/g, '\\"') : ''
      let val = arr1[j][allLanguage[lang]] ? arr1[j][allLanguage[lang]].replace(/[\r\n]/g, '').replace(/"/g, '\\"') : ''
      if (j === arr1.length - 1) {
        exportLStr += `\n\t\t"${key}" : "${val}"`
      } else {
        exportLStr += `\n\t\t"${key}" : "${val}",`
      }
    }
    if (lang === allLanguage.length - 1) {
      exportEStr += `\n\t"${allLanguage[lang]}" : {${exportLStr}\n\t}`
    } else {
      exportEStr += `\n\t"${allLanguage[lang]}" : {${exportLStr}\n\t},`
    }
  }
  fs.writeFileSync(path.resolve(nodePath, 'main.json'), `{${exportEStr}\n}`)
}

//process the `records` array and do something with it
base('Current Airtable Title')
  .select({ view: view })
  .eachPage(processPage, processRecords)


// Good Luck.
// Danny Zhang.
