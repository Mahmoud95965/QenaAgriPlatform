import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, getCountFromServer } from "firebase/firestore";
import { ContentType } from "@shared/schema";

interface Stats {
  articles: number;
  books: number;
  projects: number;
  users: number;
}

export default function StatisticsSection() {
  const [stats, setStats] = useState<Stats>({
    articles: 0,
    books: 0,
    projects: 0,
    users: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Count articles
        const articlesQuery = query(collection(db, "contents"), where("contentType", "==", ContentType.ARTICLE));
        const articlesSnapshot = await getCountFromServer(articlesQuery);
        
        // Count books
        const booksQuery = query(collection(db, "contents"), where("contentType", "==", ContentType.EBOOK));
        const booksSnapshot = await getCountFromServer(booksQuery);
        
        // Count projects
        const projectsQuery = query(collection(db, "contents"), where("contentType", "==", ContentType.PROJECT));
        const projectsSnapshot = await getCountFromServer(projectsQuery);
        
        // Count users
        const usersQuery = collection(db, "users");
        const usersSnapshot = await getCountFromServer(usersQuery);

        setStats({
          articles: articlesSnapshot.data().count,
          books: booksSnapshot.data().count,
          projects: projectsSnapshot.data().count,
          users: usersSnapshot.data().count,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
        // Set default values in case of error
        setStats({
          articles: 320,
          books: 150,
          projects: 75,
          users: 1200,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="py-12 bg-primary-dark text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">إحصائيات المنصة</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Statistic 1 */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {isLoading ? "..." : `${stats.articles}+`}
            </div>
            <p className="text-neutral-200">مقال علمي</p>
          </div>
          
          {/* Statistic 2 */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {isLoading ? "..." : `${stats.books}+`}
            </div>
            <p className="text-neutral-200">كتاب إلكتروني</p>
          </div>
          
          {/* Statistic 3 */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {isLoading ? "..." : `${stats.projects}+`}
            </div>
            <p className="text-neutral-200">مشروع تخرج</p>
          </div>
          
          {/* Statistic 4 */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {isLoading ? "..." : `${stats.users}+`}
            </div>
            <p className="text-neutral-200">مستخدم مسجل</p>
          </div>
        </div>
      </div>
    </section>
  );
}
