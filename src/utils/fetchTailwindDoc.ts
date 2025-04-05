import Crawler from "crawler";
import * as cheerio from "cheerio";

// Define interfaces for results and return type
interface TailwindDocResult {
  title: string;
  url: string;
  content: string;
}

interface TailwindDocsResponse {
  results: TailwindDocResult[];
  query: string;
  status: "complete" | "timeout" | "error";
  message?: string;
}

// 抓取选项接口
interface FetchOptions {
  urls: string[];
  query: string;
  timeout?: number;
}

/**
 * 获取 Tailwind CSS 文档数据
 */
async function fetchTailwindDocs({
  urls,
  query,
  timeout = 30000,
}: FetchOptions): Promise<TailwindDocsResponse> {
  const baseUrl = "https://tailwindcss.com";

  return new Promise((resolve, reject) => {
    const results: TailwindDocResult[] = [];
    const processedUrls = new Set<string>();
    const processedTitles = new Set<string>();

    // 设置超时处理
    const timeoutId = setTimeout(() => {
      handleTimeout(resolve);
    }, timeout);

    // 创建内容爬虫实例
    const contentCrawler = createContentCrawler();

    // 设置内容爬虫完成回调
    contentCrawler.on("drain", () => {
      clearTimeout(timeoutId);
      handleCompletion(resolve);
    });
    
    // 将所有URL添加到爬虫队列
    if (urls && urls.length > 0) {
      urls.forEach(url => {
        contentCrawler.queue(`${baseUrl}${url}`);
      });
    } else {
      // 如果没有提供URLs，直接返回空结果
      handleCompletion(resolve);
    }

    // 处理超时情况
    function handleTimeout(resolve: (value: TailwindDocsResponse) => void) {
      resolve({
        results,
        query,
        status: "timeout",
        message:
          results.length > 0
            ? `爬取超时（${timeout}ms），返回部分结果（${results.length}条）`
            : `爬取超时（${timeout}ms），未获取到任何结果`,
      });
    }

    // 处理完成情况
    function handleCompletion(resolve: (value: TailwindDocsResponse) => void) {
      resolve({
        results,
        query,
        status: "complete",
      });
    }

    // 创建内容爬虫
    function createContentCrawler(): Crawler {
      return new Crawler({
        maxConnections: 15,
        callback: (error, res, done) => {
          if (error) {
            console.error("爬取错误:", error);
            done();
            return;
          }

          const $ = res.$;
          const pageUrl = res.options.uri as string;

          // 避免重复处理
          if (processedUrls.has(pageUrl)) {
            done();
            return;
          }
          processedUrls.add(pageUrl);

          const pageTitle = $("h1").first().text().trim();

          // 检查标题是否已处理过
          if (!pageTitle || processedTitles.has(pageTitle)) {
            done();
            return;
          }
          processedTitles.add(pageTitle);

          // 提取内容
          const content = extractContent($);

          // 保存结果
          results.push({
            title: pageTitle,
            url: pageUrl,
            content,
          });

          done();
        },
      });
    }

    // 提取页面内容
    function extractContent($: cheerio.CheerioAPI): string {
      const titleParent = $("h1").first().parent();
      let docContent = "";

      titleParent.find("p, li, code, pre, h2, h3, h4, h5, h6").each((_, el) => {
        docContent += $(el).text().trim() + "\n\n";
      });

      return docContent;
    }
  });
}

export { fetchTailwindDocs, type TailwindDocsResponse };
