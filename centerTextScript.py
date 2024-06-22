def get_offset_centered_word(word, width=20):
    total_padding = width - len(word)
    left_padding = (total_padding // 2) + 1  # Adding extra padding to the left
    right_padding = total_padding - left_padding
    return ' ' * left_padding + word + ' ' * right_padding

def save_words_to_file(words, filename='words.txt'):
    with open(filename, 'w') as file:
        formatted_words = [get_offset_centered_word(word) for word in words]
        file.write(str(formatted_words))

def main():
    words = []
    print("Enter words one by one. Type 'exit' to finish.")
    
    while True:
        word = input("Enter a word: ")
        if word.lower() == 'exit':
            break
        words.append(word)
    
    save_words_to_file(words)
    print(f"Words saved to words.txt")

if __name__ == "__main__":
    main()
