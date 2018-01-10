// 并发部分
// 首先通过访问首页获取40个链接。而后并发读取四十个链接中的评论 -> eventproxy
// 利用eventproxy的after方法将所有的40个评论全部获取到之后输出

var superagent = require('superagent')
var cheerio = require('cheerio')
var eventproxy = require('eventproxy')
var url = require('url') //用于推断出完整url地址

var cnodeUrl = 'https://cnodejs.org'
var ep = new eventproxy()
superagent.get(cnodeUrl)
    .end(function(err, sres){
        if(err) {
            return next(err)
        }
        var topicUrls = [];
        var $ = cheerio.load(sres.text)
        $('#topic_list .topic_title').each(function (idx, element) {
            var $element = $(element);
            var href = url.resolve(cnodeUrl, $element.attr('href'));
            topicUrls.push(href);
        });
        console.log(topicUrls);
        ep.after('topic_html', topicUrls.length, function(topics) {
            topics = topics.map(function (topicPair) {
                // 接下来都是 jquery 的用法了
                var topicUrl = topicPair[0];
                var topicHtml = topicPair[1];
                var $ = cheerio.load(topicHtml);
                return ({
                  title: $('.topic_full_title').text().trim(),
                  href: topicUrl,
                  comment1: $('.reply_content').eq(0).text().trim(),
                });
              });
            
              console.log('final:');
              console.log(topics);
        })
        topicUrls.forEach(function(topicUrl){
            superagent.get(topicUrl)
                .end(function(err, res){
                    console.log('fetch ' + topicUrl + ' successful');
                    ep.emit('topic_html', [topicUrl, res.text]);
                })
        })
    })
