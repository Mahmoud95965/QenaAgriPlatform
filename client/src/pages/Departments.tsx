import React from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Sprout, FlaskRound, Shield, Leaf, Wheat, Droplets, Bug } from "lucide-react";

export default function Departments() {
  const departments = [
    {
      id: "horticulture",
      name: "البساتين",
      description: "يهتم بدراسة زراعة وإنتاج المحاصيل البستانية كالفاكهة والخضروات والنباتات الزينة وتكنولوجيا ما بعد الحصاد.",
      icon: <Sprout className="w-10 h-10 text-primary" />,
      features: ["إنتاج الفاكهة", "إنتاج الخضر", "نباتات الزينة", "تكنولوجيا ما بعد الحصاد"],
      image: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    },
    {
      id: "crops",
      name: "المحاصيل",
      description: "يختص بدراسة طرق زراعة وإنتاج المحاصيل الحقلية وتحسين جودتها وإنتاجيتها وتربية النباتات.",
      icon: <Wheat className="w-10 h-10 text-primary" />,
      features: ["المحاصيل الحقلية", "تربية نبات", "فسيولوجيا المحاصيل", "إنتاج البذور"],
      image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    },
    {
      id: "soil",
      name: "علوم الأراضي والمياه",
      description: "يهتم بدراسة خواص التربة الزراعية وتحسينها وإدارة الموارد المائية بكفاءة وتكنولوجيا الري الحديثة.",
      icon: <Droplets className="w-10 h-10 text-primary" />,
      features: ["خصوبة التربة", "تغذية النبات", "تكنولوجيا الري", "استصلاح الأراضي"],
      image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    },
    {
      id: "protection",
      name: "وقاية النبات",
      description: "يختص بدراسة الآفات والأمراض التي تصيب النباتات وطرق مكافحتها والوقاية منها باستخدام الطرق المتكاملة.",
      icon: <Shield className="w-10 h-10 text-primary" />,
      features: ["أمراض النبات", "حشرات اقتصادية", "مبيدات", "مكافحة حيوية"],
      image: "https://images.unsplash.com/photo-1598512191408-e8aa245d9893?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    },
    {
      id: "dairy",
      name: "الألبان",
      description: "يتضمن دراسة تكنولوجيا إنتاج وتصنيع منتجات الألبان ومراقبة جودتها وسلامتها الغذائية.",
      icon: <FlaskRound className="w-10 h-10 text-primary" />,
      features: ["تكنولوجيا الألبان", "ميكروبيولوجيا الألبان", "كيمياء الألبان", "جودة وسلامة المنتجات"],
      image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    },
    {
      id: "economy",
      name: "الاقتصاد الزراعي",
      description: "يدرس الجوانب الاقتصادية والإدارية للمشاريع الزراعية وتسويق المنتجات الزراعية والتنمية الريفية.",
      icon: <Globe className="w-10 h-10 text-primary" />,
      features: ["اقتصاد زراعي", "إدارة مزارع", "تسويق زراعي", "تنمية ريفية"],
      image: "https://images.unsplash.com/photo-1520052203542-d3095f1b6cf0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    },
    {
      id: "genetics",
      name: "الوراثة",
      description: "يختص بدراسة أساسيات علم الوراثة وتطبيقاتها في تحسين السلالات النباتية والتكنولوجيا الحيوية.",
      icon: <Leaf className="w-10 h-10 text-primary" />,
      features: ["وراثة جزيئية", "هندسة وراثية", "تكنولوجيا حيوية", "تحسين وراثي"],
      image: "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    },
    {
      id: "entomology",
      name: "الحشرات الاقتصادية",
      description: "يهتم بدراسة الحشرات ذات الأهمية الاقتصادية وتصنيفها وبيئتها وطرق مكافحتها.",
      icon: <Bug className="w-10 h-10 text-primary" />,
      features: ["تصنيف حشرات", "بيئة حشرات", "مكافحة آفات", "حشرات نافعة"],
      image: "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
    }
  ];

  return (
    <div className="min-h-screen py-12 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">أقسام كلية الزراعة</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            تعرف على الأقسام المختلفة في كلية الزراعة بقنا والتخصصات العلمية التي تقدمها
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <Card key={dept.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={dept.image} 
                  alt={dept.name}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 right-4 flex items-center">
                  <div className="bg-white bg-opacity-90 p-2 rounded-full">
                    {dept.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mr-3">{dept.name}</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-neutral-600 mb-4">{dept.description}</p>
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-neutral-800 mb-2">التخصصات:</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {dept.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-neutral-600">
                        <span className="w-2 h-2 bg-primary rounded-full ml-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href={`/departments/${dept.id}`}>
                  <a className="text-primary font-medium hover:text-primary-dark inline-flex items-center transition-colors">
                    عرض محتوى القسم
                    <svg className="ml-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
