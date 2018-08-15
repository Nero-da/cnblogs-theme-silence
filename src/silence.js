(function($) {
    'use strict';

    if (!$) {
        throwError('jQuery not found.');
    }

    $.extend({
        silence: function(options) {
            new Silence().init(options);
        }
    });

    /**
     * 捕获异常
     * @param {String} msg 
     */
    function throwError(msg) {
        throw new Error('Silence Error: ' + msg);
    }

    /**
     * 构造函数
     */
    function Silence() {

    }

    /**
     * 内部版本号
     */
    Silence.prototype.version = '1.0.0';

    /**
     * 默认配置项
     */
    Silence.prototype.defaluts = {
        catalog: {
            enable: false,
            move: true,
            index: true,
            level1: 'h2',
            level2: 'h3',
            level3: 'h4',
        },
        signature: {
            enable: false,
            author: currentBlogApp || '--',
            home: 'https://www.cnblogs.com',
            license: '署名 4.0 国际',
            link: 'https://creativecommons.org/licenses/by/4.0'
        },
        reward: {
            enable: false,
            title: null,
            wechat: null,
            alipay: null,
        }
    };

    /**
     * 博客园重要节点
     */
    Silence.prototype.cnblogs = {
        navigator: '#navigator',
        sideBar: '#sideBar',
        forFlow: '.forFlow',
        postTitle: '#cb_post_title_url',
        postDetail: '#post_detail',
        postBody: '#cnblogs_post_body',
        postCommentBody: '.blog_comment_body',
        feedbackContent: '.feedbackCon',
        mySignature: '#MySignature',
        footer: '#footer',
    };

    /**
     * 初始化
     * @param {object} options 配置选项
     */
    Silence.prototype.init = function(options) {
        if (options) {
            $.extend(true, this.defaluts, options);
        }
        this.buildMobileMenu();
        if (this.isPostDetails()) {
            this.hideSideBar();
            this.buildPostCatalog();
            this.buildPostSignature();
            this.buildPostReward();
            this.buildPostCommentAvatar();
        }
        this.buildCopyright();
    }

    /**
     * 是否为博文详情页面
     */
    Silence.prototype.isPostDetails = function() {
        return $(this.cnblogs.postDetail).length > 0;
    }

    /**
     * 显示消息（暂未使用）
     * @param {String} content 消息内容 
     */
    Silence.prototype.showMessage = function(content) {
        var $layer = $('.esa-layer');
        if (!$layer.length) {
            $('body').prepend('<div class="esa-layer"><span class="esa-layer-content"></span></div>');
        }
        $('.esa-layer-content').html(content);
        $('.esa-layer').fadeIn(250);
        setTimeout(function() {
            $('.esa-layer').fadeOut(500, function() {
                $('.esa-layer-content').empty();
            });
        }, 2500);
    }

    /**
     * 隐藏侧边栏
     */
    Silence.prototype.hideSideBar = function() {
        var that = this;
        $(that.cnblogs.sideBar).fadeOut(500, function() {
            $(that.cnblogs.forFlow).css({
                margin: '0 auto',
                maxWidth: '960px',
            });
        });
    }

    /**
     * 构建版权信息
     */
    Silence.prototype.buildCopyright = function() {
        // please don't delete this code.
        $(this.cnblogs.footer).append('<div>\
        Powered By \
        <a href="https://www.cnblogs.com" target="_blank">Cnblogs</a> | \
        <a href="https://github.com/esofar/cnblogs-theme-silence" target="_blank">Silence</a> \
        Theme By \
        <a href="https://www.cnblogs.com/esofar" target="_blank">Esofar</a></div>');
    }

    /**
     * 构建菜单按钮
     */
    Silence.prototype.buildMobileMenu = function() {
        var that = this;
        $('body').prepend('<div class="esa-mobile-menu"></div>');
        $('.esa-mobile-menu').on('click', function() {
            $(that.cnblogs.navigator).fadeToggle(200);
        });
    }

    /**
     * 构建博客签名
     */
    Silence.prototype.buildPostSignature = function() {
        var config = this.defaluts.signature;
        if (config.enable) {
            var postUrl = $(this.cnblogs.postTitle).attr('href');
            var content = '<div class="esa-post-signature"> \
                            <p>作者：<a href="' + config.home + '">' + config.author + '</a></p> \
                            <p>出处：<a href="' + postUrl + '">' + postUrl + '</a></p> \
                            <p>本站使用「<a href="' + (config.link || '#') + '"  target="_blank">' + config.license + '</a>」创作共享协议，转载请在文章明显位置注明作者及出处。</p> \
                           </div>';
            $(this.cnblogs.mySignature).html(content).show();
        }
    }

    /**
     * 构建园友头像
     */
    Silence.prototype.buildPostCommentAvatar = function() {
        var that = this;
        var builder = function() {
            $(that.cnblogs.postCommentBody).before("<div class='esa-comment-avatar'><a target='_blank'><img /></a></div>");
            var feedbackCon = $(that.cnblogs.feedbackContent);
            for (var i = 0; i < feedbackCon.length; i++) {
                var avatar = 'https://pic.cnblogs.com/face/sample_face.gif';
                var span = $(feedbackCon[i]).find("span:last")[0];
                if (span) {
                    avatar = $(span).html().replace('http://', 'https://');
                }
                $(feedbackCon[i]).find(".esa-comment-avatar img").attr("src", avatar);
                var href = $(feedbackCon[i]).parent().find(".comment_date").next().attr("href");
                $(feedbackCon[i]).find(".esa-comment-avatar a").attr("href", href);
            }
        }
        if ($(that.cnblogs.postCommentBody).length) {
            builder();
        } else {
            var count = 1;
            // poll whether the feedbacks is loaded.
            var intervalId = setInterval(function() {
                if ($(that.cnblogs.postCommentBody).length) {
                    clearInterval(intervalId);
                    builder();
                }
                if (count == 5) {
                    // no feedback.
                    clearInterval(intervalId);
                }
                count++;
            }, 1000);
        }
    }

    /**
     * 构建赞赏按钮
     */
    Silence.prototype.buildPostReward = function() {
        var config = this.defaluts.reward;
        if (config.enable) {
            if (!config.wechat && !config.alipay) {
                throwError('Reward module, both `wechat` and `alipay` are null.');
            }

            var content = '<div class="esa-reward"> \
                    <div class="esa-reward-close">+</div> \
                    <h2>"' + (config.title || '') + '"</h2> \
                    <div class="esa-reward-container">';
            if (config.wechat) {
                content += '<div class="wechat"> \
                                    <img src="' + config.wechat + '" alt="微信支付"> \
                                </div>'
            }
            if (config.alipay) {
                content += '<div class="alipay"> \
                                    <img src="' + config.alipay + '" alt="支付宝支付"> \
                                </div>'
            }
            content += '</div></div>';
            $('body').append(content);

            $('.esa-reward-close').on('click', function() {
                $(".esa-reward").fadeOut();
            });

            var builder = function() {
                $('#div_digg').prepend('<div class="reward"><span class="rewardnum" id="reward_count"></span></div>');
                $('#div_digg .reward').on('click', function() {
                    $(".esa-reward").fadeIn();
                });
            };

            if ($('#div_digg').length) {
                builder();
            } else {
                var intervalId = setInterval(function() {
                    if ($('#div_digg').length) {
                        clearInterval(intervalId);
                        builder();
                    }
                }, 500);
            }
        }
    }

    /**
     * 构建博文目录
     */
    Silence.prototype.buildPostCatalog = function() {
        var config = this.defaluts.catalog;
        if (config.enable) {
            var levels = [config.level1, config.level2, config.level3];
            var $headers = $(this.cnblogs.postBody).find(levels.join(','));
            if (!$headers.length) {
                return false;
            }
            var $catalog = $('<div class="esa-catalog"> \
                                <div class="esa-catalog-tab"><h2>目录</h2></div> \
                                <div class="esa-catalog-contents"> \
                                    <div class="esa-catalog-title"><h2>目录</h2></div> \
                                    <a class="esa-catalog-close">X</a> \
                                </div> \
                            </div>');
            var h1c = 0;
            var h2c = 0;
            var h3c = 0;

            var catalogContents = '<ul>';
            $.each($headers, function(index, header) {
                var tagName = $(header)[0].tagName.toLowerCase();
                var titleIndex = '';
                var titleContent = $(header).text();
                if (!config.index) {
                    switch (tagName) {
                        case config.level1:
                            titleContent = titleContent;
                            break;
                        case config.level2:
                            titleContent = '&nbsp;&nbsp;' + titleContent;
                            break;
                        case config.level3:
                            titleContent = '&nbsp;&nbsp;&nbsp;&nbsp;' + titleContent;
                            break;
                    }
                } else {
                    if (tagName === config.level1) {
                        h1c++;
                        h2c = 0;
                        h3c = 0;
                        titleIndex = h1c + ".&nbsp;";
                    } else if (tagName === config.level2) {
                        h2c++;
                        h3c = 0;
                        titleIndex = "&nbsp;&nbsp;" + h1c + "." + h2c + ".&nbsp;";
                    } else if (tagName === config.level3) {
                        h3c++;
                        titleIndex = "&nbsp;&nbsp;&nbsp;&nbsp;" + h1c + "." + h2c + "." + h3c + ".&nbsp;";
                    }
                }
                catalogContents += '<li class="li_' + tagName + '" title="' + titleContent + '"><i id="esa_index_' + index + '"></i><a class="esa-anchor-link">' + (titleIndex + titleContent) + '</a></li>';
                $(header).attr('id', 'esa_index_' + index);
            });
            catalogContents += '</ul>';
            $catalog.find('.esa-catalog-contents').append(catalogContents);
            $catalog.appendTo('body');

            var fixedOffsetTop = 70;
            $('.esa-anchor-link').on('click', function() {
                var href = $(this).prev('i').attr('id');
                var position = $('#' + href).offset().top - fixedOffsetTop;
                $('html, body').animate({ scrollTop: position }, 300);
            });

            $('.esa-catalog-tab').on('click', function() {
                $(this).hide();
                $('.esa-catalog-contents').show();
            });
            $('.esa-catalog-close').on('click', function() {
                $('.esa-catalog-contents').hide();
                $('.esa-catalog-tab').show();
            });

            if (config.move) {
                var move = {
                    start: false,
                    pois: [0, 0],
                };
                $('.esa-catalog-title').on('mousedown', function(e) {
                    e.preventDefault();
                    move.start = true;
                    var position = $('.esa-catalog').position();
                    var poisX = e.clientX - parseFloat(position.left);
                    var poisY = e.clientY - parseFloat(position.top);
                    move.pois = [poisX, poisY];
                });
                $(document).on('mousemove', function(e) {
                    if (move.start) {
                        var offsetX = e.clientX - move.pois[0];
                        var offsetY = e.clientY - move.pois[1];
                        var fixed = $('.esa-catalog').css('position') === 'fixed';

                        e.preventDefault();

                        move.stX = fixed ? 0 : $(window).scrollLeft();
                        move.stY = fixed ? 0 : $(window).scrollTop();

                        var setRig = $(window).width() - $('.esa-catalog').outerWidth() + move.stX;
                        var setBot = $(window).height() - $('.esa-catalog').outerHeight() + move.stY;

                        offsetX < move.stX && (offsetX = move.stX);
                        offsetX > setRig && (offsetX = setRig);
                        offsetY < move.stY && (offsetY = move.stY);
                        offsetY > setBot && (offsetY = setBot);

                        $('.esa-catalog').css({
                            left: offsetX,
                            top: offsetY,
                            right: 'auto',
                        });
                    }
                }).on('mouseup', function(e) {
                    if (move.start) {
                        move.start = false;
                    }
                });
            }
        }
    }
})(jQuery);