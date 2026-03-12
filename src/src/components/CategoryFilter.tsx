import { motion } from 'framer-motion';
import { categories } from '../data/agents';

interface CategoryFilterProps {
    activeCategory: string;
    setActiveCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ activeCategory, setActiveCategory }) => {
    return (
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 max-w-4xl pt-8 pb-4">
            {categories.map((category, index) => {
                const isActive = activeCategory === category.id;
                return (
                    <motion.button
                        key={category.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setActiveCategory(category.id)}
                        className={`relative px-5 py-2.5 rounded-2xl text-[11px] font-bold tracking-widest uppercase transition-all duration-300 border ${isActive
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-emerald-600 hover:border-slate-300'
                            }`}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <span className={`text-base leading-none ${isActive ? 'text-white' : 'text-slate-400 opacity-60'}`}>{category.icon}</span>
                            {category.name}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
};

export default CategoryFilter;
