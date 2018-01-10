//实现一个网页爬虫的核心步骤
//1. 访问网页 -> node
//2. 抓取网页 -> superagent
//3. 获取内容 -> cheerio
var express = require('express')
var app = express()
var superagent = require('superagent')
var cheerio = require('cheerio')
app.get('/', function(req, res, next) {
    superagent.get('https://cnodejs.org')
        .end(function(err, sres) {
            if(err) {
                return next(err)
            }
            var $ = cheerio.load(sres.text)
            var items = []
            $('#topic_list .topic_title').each(function(idx, element) {
                var $element = $(element)
                items.push({
                    title: $element.attr('title'),
                    href: $element.attr('href')
                })
            })
            res.send(items)
        })
})
app.listen(3000, function(){
    console.log('app is listening at port 3000');

})