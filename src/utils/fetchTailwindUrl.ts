import Crawler from "crawler";

// Define interfaces for results and return type

interface TailwindUrlResponse {
  results: string[];
  query: string;
  version: string;
  status: "complete" | "timeout" | "error";
  message?: string;
}

// 抓取选项接口
interface FetchOptions {
  query: string;
  version: string;
  timeout?: number;
}

/**
 * 获取 Tailwind CSS 文档数据
 */
async function fetchTailwindUrl({
  query,
  version = "latest",
  timeout = 30000,
}: FetchOptions): Promise<TailwindUrlResponse> {
  const baseUrl = "https://tailwindcss.com";
  const docsUrl = `${baseUrl}/docs/installation/using-vite`;

  return new Promise((resolve, reject) => {
    const results: string[] = [];
    const processedUrls = new Set<string>();

    // 设置超时处理
    const timeoutId = setTimeout(() => {
      handleTimeout(resolve);
    }, timeout);

    // 创建索引爬虫实例
    const indexCrawler = createIndexCrawler(reject);

    // 设置内容爬虫完成回调
    indexCrawler.on("drain", () => {
      clearTimeout(timeoutId);
      handleCompletion(resolve);
    });

    // 开始爬取文档索引
    indexCrawler.queue(docsUrl);

    // 处理超时情况
    function handleTimeout(resolve: (value: TailwindUrlResponse) => void) {
      resolve({
        results,
        query,
        version,
        status: "timeout",
        message:
          results.length > 0
            ? `爬取超时（${timeout}ms），返回部分结果（${results.length}条）`
            : `爬取超时（${timeout}ms），未获取到任何结果`,
      });
    }

    // 处理完成情况
    function handleCompletion(resolve: (value: TailwindUrlResponse) => void) {
      resolve({
        results,
        query,
        version,
        status: "complete",
      });
    }

    // 创建索引爬虫
    function createIndexCrawler(reject: (reason: any) => void): Crawler {
      return new Crawler({
        maxConnections: 1,
        callback: (error, res, done) => {
          if (error) {
            reject(error);
            done();
            return;
          }
          
          const $ = res.$;
          const links = findDocumentationLinks($);

          // 将链接添加到内容爬虫队列
          links.forEach((link) => {
            // 避免重复处理
            if (processedUrls.has(link)) {
              return;
            }
            processedUrls.add(link);
            results.push(`${link}`);
          });

          done();
        },
      });
    }

    // 查找文档链接
    function findDocumentationLinks($: cheerio.CheerioAPI): string[] {
      const links: string[] = [];

      $('a[href^="/docs/"]').each((_, el) => {
        const href = $(el).attr("href");
        if (href && !links.includes(href) && !href.includes("#")) {
          links.push(href);
        }
      });

      return links;
    }
  });
}

export { fetchTailwindUrl, type TailwindUrlResponse };
